import React, { FC, FormEvent, useState, createRef, useRef, useEffect, } from 'react';
import axios, { CancelTokenSource } from 'axios';
import classnames from 'classnames';
import Modal from 'react-bootstrap/Modal';

interface IModalProps {
	open: boolean
	handleClose: () => void
	percent: number
	uploaded: boolean
	procPercent: number
	procced: boolean
	filename: string
}

const MyModal: React.FC<IModalProps> = (props) => {
	const {open, handleClose, percent, uploaded, procPercent, procced, filename} = props;
	const [url, setUrl] = useState(`http://localhost:3001/${filename}.mp4`);
	const [audioUrl, setAudioUrl] = useState(`http://localhost:3001/${filename}.wav`);

	return (
		<Modal show={open} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>
					{`Uploading File`}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div>
					<span>{`Uploading File... (${percent} %)`}</span>
				</div>
				<div className="d-flex align-items-center">
					<div className="progress flex-grow-1">
						<div
							className="progress-bar progress-bar-striped bg-success progress-bar-animated"
							role="progressbar"
							style={{width: `${percent}%`}}
							aria-valuenow={percent}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
					</div>
					<span className={!uploaded ? 'd-none' : ''}>
						<i className={classnames('fa fa-fa fa-check-circle ml-2 text-success')}/>
					</span>
					<span className={uploaded ? 'd-none' : ''}>
						<i className={classnames('fa fa-fa fa-spinner fa-pulse ml-2')}/>
					</span>
				</div>
				<div className={'mt-4'}>
					<span>{`Processing File... (${procPercent} %)`}</span>
				</div>
				<div className="d-flex align-items-center">
					<div className="progress flex-grow-1">
						<div
							className="progress-bar progress-bar-striped bg-warning progress-bar-animated"
							role="progressbar"
							style={{width: `${procPercent}%`}}
							aria-valuenow={procPercent}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
					</div>
					<span className={!procced ? 'd-none' : ''}>
						<i className={classnames('fa fa-fa fa-check-circle ml-2 text-success')}/>
					</span>
					<span className={procced ? 'd-none' : ''}>
						<i className={classnames('fa fa-fa fa-spinner fa-pulse ml-2')}/>
					</span>
				</div>
			</Modal.Body>

			<Modal.Footer>
				{procced ? (
					<>
						<a type="button" className="btn btn-primary btn-sm" href={url} download={true}
						   target={'_blank'}>
							<i className="fa fa-fw fa-download mr-2"/>
							<span>{'Download File'}</span>
						</a>
						<a type="button" className="btn btn-primary btn-sm" href={audioUrl} download={true}
						   target={'_blank'}>
							<i className="fa fa-fw fa-file-audio mr-2"/>
							<span>{'Download Audio'}</span>
						</a>
					</>
				) : (
					<button type="button" className="btn btn-danger btn-sm" onClick={handleClose}>
						<i className="fa fa-fw fa-times mr-2"/>
						<span>{'Cancel'}</span>
					</button>
				)}
			</Modal.Footer>
		</Modal>
	);
}

const App: FC = () => {
	const downloadRef = createRef<HTMLAnchorElement>();
	const fileRef = createRef<HTMLInputElement>();
	const [filename, setFilename] = useState('');
	const [loading, setLoading] = useState(false);
	const [percent, setPercent] = useState(0);
	const [procPercent, setProcPercent] = useState(0);
	const [procced, setProcced] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const [source, setSource] = useState('tr');
	const [target, setTarget] = useState('en');
	const [modalOpen, setModalOpen] = useState(false);
	const cancelSource = useRef<CancelTokenSource>();
	const handleCloseModal = () => {
		cancelSource.current?.cancel('Manually!');
		setLoading(false);
		setProcced(false);
		setUploaded(false);
		setProcPercent(0);
		setPercent(0);
		setModalOpen(false);
	}

	const procProgressPercent = () => {
		setTimeout(() => setProcPercent(15), 1000);
		setTimeout(() => setProcPercent(65), 3000);
		setTimeout(() => setProcPercent(85), 6000);
		// setTimeout(() => {
		// 	setProcPercent(100);
		// 	setProcced(true);
		// }, 2300);
	}

	const handleNull = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let file = null;
		const input = fileRef.current;
		if (input && input.files && input.files.length) {
			file = input.files[0];
			setFilename(file.name);
		}
	}

	const handleProgress = (progress: any) => {
		const sofar = Math.round((progress.loaded * 100) / progress.total);
		console.log(sofar);
		setPercent(sofar);
		if (sofar >= 100) {
			setUploaded(true);
		}
	}

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (e.target.name === 'source') {
			setSource(e.target.value);
		}

		if (e.target.name === 'target') {
			setTarget(e.target.value);
		}
	}

	const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
		e.preventDefault();
		cancelSource.current = axios.CancelToken.source();
		let file = null;
		const input = fileRef.current;
		if (input && input.files && input.files.length) {
			file = input.files[0];
		}

		if (!file) { return; }

		setLoading(true);
		setModalOpen(true);

		const data = new FormData();
		data.append('media', file);
		data.append('source', source);
		data.append('target', target);

		procProgressPercent();

		axios.post(`http://127.0.0.1:3001/upload`, data, {
			headers: {'Accept': '*'},
			onUploadProgress: handleProgress,
			cancelToken: cancelSource.current.token,
		})
			.then(res => {
				setProcPercent(100);
				setProcced(true);
				return res.data;
			})
			.then(response => new Blob([response as string], {
				type: 'text/plain',
			}))
			.then(blob => URL.createObjectURL(blob))
			.then(url => {
				const input = fileRef.current;
				let file = null;
				if (input && input.files && input.files.length) {
					file = input.files[0];
					console.log(file);
				}

				// const link = document.createElement('a');
				// link.href = url;
				// link.setAttribute('download', `${filename}`);
				// document.body.append(link);
				// link.click();
				// link.parentNode?.removeChild(link);
			})
			.catch(err => console.error(err));
	}

	return (
		<>
			<div className="container mt-5">
				<a href="/" download={true} ref={downloadRef}/>
				<div className={'row'}>
					<div className="col-8 offset-2">
						<div className={'mt-2 mb-5 text-center'}>
							<h4>{'Video/Audio File Auto Dubbing Tool'}</h4>
						</div>

						<div className="card shadow-sm">
							<div className="card-header bg-primary">
								<h3 className={'card-title text-white'}>{'Upload File'}</h3>
							</div>
							<div className="card-body">
								<form onSubmit={handleNull}>
									<div className="form-group row">
										<label htmlFor="language"
											   className={'col-3 col-form-label'}>{'Source Language:'}</label>
										<div className="col-9">
											<select className={'form-control'} value={source}
													onChange={handleSelectChange} name="source">
												<option value="en" disabled={target == 'en'}>{'English'}</option>
												<option value="de" disabled={target == 'de'}>{'German'}</option>
												<option value="fr" disabled={target == 'fr'}>{'French'}</option>
												<option value="it" disabled={target == 'it'}>{'Italian'}</option>
												<option value="tr" disabled={target == 'tr'}>{'Turkish'}</option>
											</select>
										</div>
									</div>
									<div className="form-group row">
										<label htmlFor="language"
											   className={'col-3 col-form-label'}>{'Target Language:'}</label>
										<div className="col-9">
											<select className={'form-control'} value={target}
													onChange={handleSelectChange} name="target">
												<option value="en" disabled={source == 'en'}>{'English'}</option>
												<option value="de" disabled={source == 'de'}>{'German'}</option>
												<option value="fr" disabled={source == 'fr'}>{'French'}</option>
												<option value="it" disabled={source == 'it'}>{'Italian'}</option>
												<option value="tr" disabled={source == 'tr'}>{'Turkish'}</option>
											</select>
										</div>
									</div>
									<div className="form-group row">
										<label htmlFor="file" className={'col-3 col-form-label'}>{'File:'}</label>
										<div className={'col-9'}>
											<input ref={fileRef} className={'form-control-file'}
												   onChange={handleFileChange} type="file"/>
										</div>
									</div>
								</form>
							</div>
							<div className="card-footer">
								<div className="d-flex align-items-center justify-content-end">
									<button className={'btn btn-warning mr-4 shadow-sm btn-sm'} type={'button'}
											disabled={loading}>
										<i className={classnames('fa fa-fw mr-2 fa-sync-alt')}/>
										<span>{'Reset'}</span>
									</button>
									<button onClick={handleSubmit} className={'btn btn-success shadow-sm btn-sm'}
											type={'button'}
											disabled={loading}>
										<i className={classnames('fa fa-fw mr-2 fa-upload')}/>
										<span>{'Submit'}</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<MyModal
				open={modalOpen}
				handleClose={handleCloseModal}
				procPercent={procPercent}
				procced={procced}
				percent={percent}
				uploaded={uploaded}
				filename={filename}
			/>
		</>
	);
}

export default App;
