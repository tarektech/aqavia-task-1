import { FormRequirements, Preview } from "@/components";

export default function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ">
      {/* inputs form */}
      <div >
        <FormRequirements />
      </div>

      {/* preview section */}
      <div className="relative">
        <Preview />
      </div>
    </div>
  );
}
