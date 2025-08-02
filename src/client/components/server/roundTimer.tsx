export default function RoundTimer(props: { timeLeft: number; listUpdatedAt: number }) {
	const { timeLeft, listUpdatedAt } = props;

	return (
		<>
			<script>
				{`
        const timeLeft = ${timeLeft * 1000};
        const listUpdatedAt = ${listUpdatedAt};

        function updateTimer() {

        const currentTime = Date.now();
        const elapsedTime = currentTime - listUpdatedAt;
        const remainingTime = timeLeft - elapsedTime;

        const secondsLeft = Math.floor(remainingTime / 1000);
        const minutesLeft = Math.floor(secondsLeft / 60);
        const displayMinutes = String(minutesLeft).padStart(1, '0');
        const displaySeconds = String(secondsLeft % 60).padStart(2, '0');

        const timeDisplay = displayMinutes + ':' + displaySeconds;
        const timeElement = document.querySelector('.time-display');

      

        if (timeElement) {
            if (remainingTime <= 0) {
                timeElement.textContent = '0:00';
            } else {
                 timeElement.textContent = timeDisplay;
            }
        }

        setInterval(updateTimer, 1000);
        updateTimer();
        `}
			</script>

			<div class="time">
				<span class="time-display"></span>
			</div>
		</>
	);
}
