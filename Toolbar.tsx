import * as React from "react";
import { AppContext } from "./context";

const Toolbar = () => {
	const {
		getTotalNotesToTravel,
		getRemainNotesToTravel,
		travelToNext,
		resetTravel,
		getStartedNotePath,
	} = React.useContext(AppContext);
	const [total, setTotal] = React.useState(getTotalNotesToTravel());
	const [traveled, setTraveled] = React.useState(
		getTotalNotesToTravel() - getRemainNotesToTravel()
	);
	const [startedPath, setStartedPath] = React.useState(getStartedNotePath());

	const handleClickNext = () => {
		travelToNext();
		setTraveled(getTotalNotesToTravel() - getRemainNotesToTravel());
	};
	const handleClickReset = () => {
		resetTravel();
		setTotal(getTotalNotesToTravel());
		setTraveled(getTotalNotesToTravel() - getRemainNotesToTravel());
		setStartedPath(getStartedNotePath())
	};
	return (
		<div className="float-toolbar">
			<button
				onClick={() => {
					handleClickReset();
				}}
			>
				Reset
			</button>
			{startedPath ? (
				<>
					<p style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis", maxWidth:"12rem"}}>{startedPath}</p>
					<p>
						{traveled}/{total}
					</p>
				</>
			) : (
				<p>reset travel to begin</p>
			)}
			<button
				onClick={() => {
					handleClickNext();
				}}
			>
				Next
			</button>
		</div>
	);
};
export default Toolbar;
