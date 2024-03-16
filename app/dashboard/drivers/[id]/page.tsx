import { supabase } from "../../../../utils/supabase/supabase";
import DriverReview from "@/components/driver/driverreview";
import EmbeddedContent from "@/components/googlemaps/locations";
import TableOrders from "@/components/lists/tableorders";
import DriverPhoto from "@/components/page-headings/headings";
import DriverOverview from "@/components/productoverview/productoverview";

async function getData(id: number) {
  // Fetch blog data along with the user's information using a single query
  const { data: blogs, error } = await supabase
    .from("drivers")
    .select(`*`)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }

  return blogs;
}

const page = async ({ params }) => {
  const item = await getData(params.id);

  return (
    <main className="py-10 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8">
        <DriverPhoto driver={item} />
        <DriverOverview driver={item} />
        <TableOrders />
        <DriverReview />
      </div>
    </main>
  );
};

export default page;
