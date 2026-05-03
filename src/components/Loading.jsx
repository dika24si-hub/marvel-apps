import { Circles } from "react-loader-spinner";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Circles
        height="80"
        width="80"
        color="#3b82f6"
        ariaLabel="loading"
      />
    </div>
  );
}