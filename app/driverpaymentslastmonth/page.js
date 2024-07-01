import DriverPaymentsClient from "./DriverPaymentsClient";

const DriverPaymentsPage = ({ searchParams }) => {
  const driverId = searchParams.driverId;

  return <DriverPaymentsClient driverId={driverId} />;
};

export default DriverPaymentsPage;
