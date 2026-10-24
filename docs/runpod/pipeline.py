#!/usr/bin/env python3
"""Cauce GPU experiment. Run inside a provisioned Nerfstudio CUDA container.
No paid API calls; does not provision or stop the RunPod instance.
"""
import argparse, hashlib, json, os, pathlib, shutil, signal, subprocess, sys, time

def inspect_alignment(data_dir, expected, minimum=0.70):
    p = pathlib.Path(data_dir) / 'transforms.json'
    if not p.exists():
        raise RuntimeError('COLMAP did not produce transforms.json; no reconstruction is claimed.')
    data = json.loads(p.read_text())
    count = len(data.get('frames', []))
    ratio = count / expected if expected else 0
    if count < 30 or ratio < minimum:
        raise RuntimeError(f'Insufficient alignment: {count}/{expected} frames ({ratio:.0%}). Inspect capture before training.')
    return {'registered_frames': count, 'extracted_frames': expected, 'registered_ratio': ratio}

def run(args):
    video = pathlib.Path(args.video).resolve()
    if not video.is_file():
        raise RuntimeError('The complete local video file is required.')
    root = pathlib.Path(args.output).resolve()
    root.mkdir(parents=True, exist_ok=False)
    start = time.monotonic()
    deadline = start + args.max_minutes * 60
    status = {'state': 'starting', 'started_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'input_name': video.name, 'input_bytes': video.stat().st_size, 'reconstruction_verified': False}
    def update(stage, **extra):
        status.update(state=stage, elapsed_seconds=round(time.monotonic()-start, 2), **extra)
        temp = root / 'status.tmp'
        temp.write_text(json.dumps(status, indent=2))
        temp.replace(root / 'status.json')
        print(stage, flush=True)
    def command(stage, argv):
        update(stage)
        remaining = deadline-time.monotonic()
        if remaining <= 0: raise TimeoutError('Experiment wall-time limit reached.')
        with (root / (stage+'.log')).open('w') as log:
            proc = subprocess.Popen(argv, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
            try:
                code = proc.wait(timeout=remaining)
            except BaseException:
                os.killpg(proc.pid, signal.SIGTERM)
                try: proc.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid, signal.SIGKILL)
                    proc.wait()
                raise
        if code: raise RuntimeError(f'{stage} failed ({code}); inspect {stage}.log')
    try:
        if sys.platform != 'linux': raise RuntimeError('Execute on the Linux GPU pod, not Windows.')
        for tool in ['nvidia-smi','ffmpeg','ffprobe','ns-process-data','ns-train','ns-export']:
            if not shutil.which(tool): raise RuntimeError('Missing prerequisite: '+tool)
        command('gpu_check', ['nvidia-smi'])
        metadata = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)], timeout=30))
        (root/'video-metadata.json').write_text(json.dumps(metadata,indent=2))
        duration=float(metadata['format']['duration'])
        if not 1 < duration < 3600: raise RuntimeError('Unexpected video duration.')
        with video.open('rb') as f:
            digest=hashlib.file_digest(f,'sha256').hexdigest() if hasattr(hashlib,'file_digest') else None
        images=root/'images'; images.mkdir()
        fps=args.frames/duration
        command('extracting_frames',['ffmpeg','-nostdin','-v','warning','-i',str(video),'-vf',f'fps={fps},scale=1600:1600:force_original_aspect_ratio=decrease','-frames:v',str(args.frames),'-q:v','2',str(images/'frame_%05d.jpg')])
        count=len(list(images.glob('*.jpg')))
        data=root/'aligned'
        command('aligning_cameras',['ns-process-data','images','--data',str(images),'--output-dir',str(data)])
        report=inspect_alignment(data,count,args.min_registration)
        update('alignment_checked',alignment=report,input_sha256=digest)
        output=root/'training'
        command('training_splats',['ns-train','splatfacto','--data',str(data),'--output-dir',str(output),'--experiment-name','tecnoteca','--max-num-iterations',str(args.iterations),'--vis','tensorboard'])
        configs=list(output.rglob('config.yml'))
        if len(configs)!=1: raise RuntimeError('Expected one training config, found '+str(len(configs)))
        export=root/'export'
        command('exporting_splats',['ns-export','gaussian-splat','--load-config',str(configs[0]),'--output-dir',str(export)])
        plys=list(export.glob('*.ply'))
        if not plys or min(p.stat().st_size for p in plys)<1024: raise RuntimeError('Missing or empty PLY export.')
        update('awaiting_visual_review',artifacts=[str(p.relative_to(root)) for p in plys],note='Training/export finished. Quality, scale, coverage and browser playback still need verification. The pod is still billable until stopped in RunPod.')
    except BaseException as exc:
        update('failed',error=str(exc),note='No validated reconstruction. The pod is not stopped automatically.')
        raise

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--video',required=True)
    p.add_argument('--output',required=True,help='New experiment directory; never overwrites an existing run')
    p.add_argument('--frames',type=int,default=200)
    p.add_argument('--iterations',type=int,default=7000)
    p.add_argument('--max-minutes',type=int,default=60)
    p.add_argument('--min-registration',type=float,default=.70)
    args=p.parse_args()
    if not 30<=args.frames<=1000 or not 100<=args.iterations<=30000 or not 1<=args.max_minutes<=180 or not 0<args.min_registration<=1:
        p.error('Arguments outside experiment bounds')
    run(args)
