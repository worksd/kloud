'use client';

import Image from "next/image";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import CheckIcon from "../../../public/assets/check_white.svg"
import { useLocale } from "@/hooks/useLocale";
import { useEffect, useState } from "react";

interface StudioCardProps {
  studio: GetStudioResponse;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const StudioCard = ({studio, isSelected, onSelect}: StudioCardProps) => {
  const onClickStudioCard = (studioId: number) => {
    onSelect(studioId);
  }
  return <div
    className="flex flex-col cursor-pointer"
    onClick={() => onClickStudioCard(studio.id)}
  >
    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
      <Image
        src={studio.profileImageUrl}
        alt={studio.name}
        fill
        className="object-cover"
      />
      {isSelected && (
        <>
          <div className="absolute inset-0 bg-black/50 transition-all duration-200"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckIcon/>
          </div>
        </>
      )}
    </div>
    <div className={`text-[16px] text-center transition-colors duration-200 ${
      isSelected ? 'text-black font-bold' : 'text-gray-300 font-normal'
    }`}>
      {studio.name}
    </div>
  </div>
}
export const FavoriteStudioForm = ({
                                     selectedIdList,
                                     onSelectStudioAction,
                                     studios
                                   }: {
  selectedIdList: number[],
  onSelectStudioAction: (id: number) => void,
  studios: GetStudioResponse[]
}) => {

  const {t} = useLocale();
  const [mounted, setMounted] = useState(false)
  const handleSelect = (id: number) => {
    onSelectStudioAction(id);  // 직접 ID만 전달
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  return (
    <div className="flex flex-col bg-white">
      <div className="flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-2 text-black">
          {mounted ? t('follow_studio_message') : ''}
        </h1>
        <p className="text-gray-600 mb-8">
          {mounted ? t('follow_studio_description') : ''}
        </p>

        <div className="grid grid-cols-3 gap-4">
          {studios.map((studio) => (
            <StudioCard
              key={studio.id}
              studio={studio}
              isSelected={selectedIdList.includes(studio.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}