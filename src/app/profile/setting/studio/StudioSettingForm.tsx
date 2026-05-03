'use client'

import React, { useState } from "react";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { StudioSettingItem } from "@/app/profile/setting/studio/StudioSettingItem";
import { saveStudioIdAction } from "@/app/studios/save.studio.id.action";
import { kloudNav } from "@/app/lib/kloudNav";

export const StudioSettingForm = ({
  myStudios,
  recommendedStudios,
  currentStudioId,
  myStudiosLabel,
  recommendedStudiosLabel,
}: {
  myStudios: GetStudioResponse[];
  recommendedStudios: GetStudioResponse[];
  currentStudioId?: string;
  myStudiosLabel: string;
  recommendedStudiosLabel: string;
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(
    currentStudioId ? Number(currentStudioId) : null
  );
  const [saving, setSaving] = useState(false);

  const hasChanged = currentStudioId !== `${selectedId}`;

  const handleSave = async () => {
    if (!selectedId || saving) return;
    setSaving(true);
    await saveStudioIdAction({ studioId: selectedId });
    await kloudNav.navigateMain({});
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 pt-4">
        {myStudios.length > 0 && (
          <Section label={myStudiosLabel}>
            {myStudios.map((studio) => (
              <StudioSettingItem
                key={studio.id}
                item={studio}
                isSelected={selectedId === studio.id}
                onSelect={() => setSelectedId(studio.id)}
              />
            ))}
          </Section>
        )}

        {recommendedStudios.length > 0 && (
          <Section label={recommendedStudiosLabel}>
            {recommendedStudios.map((studio) => (
              <StudioSettingItem
                key={studio.id}
                item={studio}
                isSelected={selectedId === studio.id}
                onSelect={() => setSelectedId(studio.id)}
              />
            ))}
          </Section>
        )}
      </div>

      <div className="sticky bottom-0 px-4 pb-8 pt-3 bg-white">
        <button
          onClick={handleSave}
          disabled={!selectedId || !hasChanged || saving}
          className={`w-full py-4 rounded-xl text-[16px] font-bold transition-all duration-150 active:scale-[0.98] ${
            selectedId && hasChanged && !saving
              ? 'bg-[#1E2124] text-white'
              : 'bg-[#F0F0F0] text-[#BDBDBD] cursor-not-allowed'
          }`}
        >
          {saving ? '...' : '선택하기'}
        </button>
      </div>
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <div className="px-6 pt-2 pb-2">
      <span className="text-[13px] font-bold text-[#86898C]">{label}</span>
    </div>
    {children}
  </div>
);
