import React, { FC, FormEvent, useRef, useState, createRef, } from 'react';
import classnames from 'classnames';

declare const $: any;

const App: FC = () => {
	const fileRef = createRef<HTMLInputElement>();
	const [loading, setLoading] = useState(false);
	const [percent, setPercent] = useState(0);
	const [procPercent, setProcPercent] = useState(0);
	const [procced, setProcced] = useState(false);
	const [uploaded, setUploaded] = useState(false);

	const progressPercent = () => {
		setTimeout(() => setPercent(15), 500);
		setTimeout(() => setPercent(65), 1300);
		setTimeout(() => setPercent(85), 1800);
		setTimeout(() => {
			setPercent(100);
			setUploaded(true);

			procProgressPercent();
		}, 2300);
	};

	const procProgressPercent = () => {
		setTimeout(() => setProcPercent(15), 500);
		setTimeout(() => setProcPercent(65), 1300);
		setTimeout(() => setProcPercent(85), 1800);
		setTimeout(() => {
			setProcPercent(100);
			setProcced(true);
		}, 2300);
	}

	const handleNull = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	}

	const handleSubmit = (e: FormEvent<HTMLButtonElement>) => {
		e.preventDefault();
		let file = null;
		const input = fileRef.current;
		if (input && input.files && input.files.length) {
			file = input.files[0];
		}

		setLoading(true);
		$('#modal').modal('show');
		progressPercent();
		$('#myModal').on('hide.bs.modal', function () {
			setUploaded(false);
			setPercent(0);
			setProcced(false);
			setProcPercent(0);
		});

		setTimeout(() => setLoading(false), 1000);

		if (!file) { return; }

		const data = new FormData();
		data.append('file', file);
		data.append('source', 'English');
		data.append('target', 'Turkish');

		fetch(`http://127.0.0.1:3000/upload`, {
			mode: 'no-cors',
			method: 'POST',
			headers: { 'Accept': '*', },
			body: data,
		}).then(res => res.json()).then(res => console.log(res)).catch(err => console.error(err));
	}

	return (
		<>
			<div className="container mt-5">
				<div className={'row'}>
					<div className="col-8 offset-2">
						<div className={'mt-2 mb-5 text-center'}>
							<h4>{'Video/Audio File Auto Dubbing Tool'}</h4>
						</div>

						<div className="card shadow-sm">
							<div className="card-header bg-primary">
								<h3 className={'card-title text-white'}>{'Upload File'} {loading ? 'true' : 'false'}</h3>
							</div>
							<div className="card-body">
								<form onSubmit={handleNull}>
									<div className="form-group row">
										<label htmlFor="language"
											   className={'col-3 col-form-label'}>{'Source Language:'}</label>
										<div className="col-9">
											<select className={'form-control'}>
												<option value="English">{'English'}</option>
												<option value="German">{'German'}</option>
												<option value="French">{'French'}</option>
												<option value="Italian">{'Italian'}</option>
												<option value="Turkish">{'Turkish'}</option>
											</select>
										</div>
									</div>
									<div className="form-group row">
										<label htmlFor="language"
											   className={'col-3 col-form-label'}>{'Target Language:'}</label>
										<div className="col-9">
											<select className={'form-control'}>
												<option value="English">{'English'}</option>
												<option value="German">{'German'}</option>
												<option value="French">{'French'}</option>
												<option value="Italian">{'Italian'}</option>
												<option value="Turkish">{'Turkish'}</option>
											</select>
										</div>
									</div>
									<div className="form-group row">
										<label htmlFor="file" className={'col-3 col-form-label'}>{'File:'}</label>
										<div className={'col-9'}>
											<input ref={fileRef} className={'form-control-file'} type="file"/>
										</div>
									</div>
									{/*<div className="form-group row">*/}
									{/*	<div className={'col-9 offset-3'}>*/}
									{/*		<button className={'btn btn-warning mr-4'} type={'button'}>*/}
									{/*			{'Reset'}*/}
									{/*		</button>*/}
									{/*		<button onClick={handleSubmit} className={'btn btn-primary'} type={'button'}>*/}
									{/*			{'Submit'}*/}
									{/*		</button>*/}
									{/*	</div>*/}
									{/*</div>*/}
								</form>
							</div>
							<div className="card-footer">
								<div className="d-flex align-items-center justify-content-end">
									<button className={'btn btn-warning mr-4 shadow-sm'} type={'button'} disabled={loading}>
										<i className={classnames('fa fa-fw mr-2 fa-sync-alt')}/>
										<span>{'Reset'}</span>
									</button>
									<button onClick={handleSubmit} className={'btn btn-success shadow-sm'} type={'button'}
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
			<div className="modal fade" tabIndex={-1} id={'modal'}>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{'Uploading File..'}</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<div>
								<span>{'Uploading File...'}</span>
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
								<span>{'Processing File...'}</span>
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
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-danger" data-dismiss="modal">
								<i className="fa fa-fw fa-times mr-2"/>
								<span>{'Cancel'}</span>
							</button>
							<button type="button" className="btn btn-primary">
								<i className="fa fa-fw fa-download mr-2"/>
								<span>{'Download File'}</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
