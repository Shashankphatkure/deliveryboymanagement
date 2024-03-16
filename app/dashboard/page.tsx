import DashboardSidebar from "@/components/application-shells/sidebar";
import DriverReview from "@/components/driver/driverreview";
import EmbeddedContent from "@/components/googlemaps/locations";
import TableOrders from "@/components/lists/tableorders";
import DriverPhoto from "@/components/page-headings/headings";
import DriverOverview from "@/components/productoverview/productoverview";
import React from "react";

const page = () => {
  return (
    <main className="py-10 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8">
        <DriverPhoto />
        <DriverOverview />
        <TableOrders />
        <DriverReview />
        <EmbeddedContent />
      </div>
    </main>
  );
};

export default page;
