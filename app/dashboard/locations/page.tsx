import EmbeddedContent from "@/components/googlemaps/locations";
import React from "react";

const page = () => {
  return (
    <div>
      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">
          <iframe
            src="/storelocations.html"
            width="100%"
            height="500px"
          ></iframe>
        </div>
      </main>
    </div>
  );
};

export default page;
