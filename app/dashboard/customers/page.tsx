import TableCustomers from "@/components/lists/tablecustomers";
import React from "react";

const page = () => {
  return (
    <main className="py-10 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8">
        <TableCustomers />
      </div>
    </main>
  );
};

export default page;
