const PlayIcon = ({ width, height }: { width: string; height: string }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 65 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="group cursor-pointer"
    >
      <path
        d="M53.58 34.8801C55.257 33.9971 55.2703 31.6003 53.6031 30.6987L13.6529 9.09477C12.074 8.24092 10.1559 9.38426 10.1559 11.1793V53.8187C10.1559 55.6022 12.0517 56.7465 13.6298 55.9156L53.58 34.8801ZM55.2135 27.7209C59.2623 29.9103 59.2301 35.7312 55.1573 37.8757L15.2071 58.9112C11.3746 60.9291 6.77051 58.15 6.77051 53.8187V11.1793C6.77051 6.81991 11.4288 4.04325 15.2633 6.11688L55.2135 27.7209Z"
        fill="white"
        className="group-hover:fill-red-600 ease-in-out duration-200"
      />
    </svg>
  );
};

export default PlayIcon;
