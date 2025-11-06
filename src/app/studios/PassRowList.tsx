import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import React from "react";
import { ActivePassItem } from "@/app/profile/myPass/PassColumnList";
import { Locale } from "@/shared/StringResource";

export const PassRowList = ({ passes, locale }: { passes: GetPassResponse[], locale: Locale }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex snap-x snap-mandatory">
        {passes.map((item: GetPassResponse) => (
          <div key={item.id} className="snap-start flex-shrink-0 px-4">
            <ActivePassItem pass={item} locale={locale}/>
          </div>
        ))}
      </div>
    </div>
  );
};