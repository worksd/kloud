// icons/banks.tsx
import IconBNK        from '../../../public/assets/ic_bank_bnk.svg';
import IconCiti       from '../../../public/assets/ic_bank_city.svg';
import IconHana       from '../../../public/assets/ic_bank_hana.svg';
import IconIBK        from '../../../public/assets/ic_bank_ibk.svg';
import IconIM         from '../../../public/assets/ic_bank_im.svg';
import IconKBank      from '../../../public/assets/ic_bank_k.svg';          // K뱅크 추정
import IconKakaoBank  from '../../../public/assets/ic_bank_kakao.svg';
import IconKB         from '../../../public/assets/ic_bank_kb.svg';
import IconKDB        from '../../../public/assets/ic_bank_kdb.svg';
import IconSaemaul    from '../../../public/assets/ic_bank_new_village.svg'; // 새마을금고
import IconNH         from '../../../public/assets/ic_bank_nh.svg';          // 농협
import IconPost       from '../../../public/assets/ic_bank_postoffice.svg';
import IconRaDo       from '../../../public/assets/ic_bank_rado.svg';        // 확인 필요
import IconSBI        from '../../../public/assets/ic_bank_sbi.svg';
import IconSC         from '../../../public/assets/ic_bank_sc.svg';
import IconShinhan    from '../../../public/assets/ic_bank_sinhan.svg';      // 파일명은 sinhan
import IconShinhyup   from '../../../public/assets/ic_bank_sinhyup.svg';     // 신협
import IconSuhyup     from '../../../public/assets/ic_bank_soohyup.svg';     // 수협
import IconToss       from '../../../public/assets/ic_bank_toss.svg';
import IconWoori      from '../../../public/assets/ic_bank_woori.svg';
import IconBC      from '../../../public/assets/ic_card_bc.svg';
import IconHyundai      from '../../../public/assets/ic_card_hyundai.svg';
import IconLotte      from '../../../public/assets/ic_card_lotte.svg';
import IconSamsung      from '../../../public/assets/ic_card_samsung.svg';

export const BANK_ICONS = {
  bnk: IconBNK,
  citi: IconCiti,
  hana: IconHana,
  ibk: IconIBK,
  im: IconIM,
  kbank: IconKBank,          // ic_bank_k.svg
  kakaobank: IconKakaoBank,
  kb: IconKB,
  kdb: IconKDB,
  saemaul: IconSaemaul,
  nonghyup: IconNH,
  post: IconPost,
  rado: IconRaDo,            // 무엇인지 확실치 않으면 이름 바꿔줄게
  sbi: IconSBI,
  sc: IconSC,
  shinhan: IconShinhan,      // 파일명 sinhan.svg
  shinhyup: IconShinhyup,    // 신협
  suhyup: IconSuhyup,        // 수협
  toss: IconToss,
  woori: IconWoori,
  bc: IconBC,
  hyundai: IconHyundai,
  samsung: IconSamsung,
  lotte: IconLotte,
} as const;

export type BankCode = keyof typeof BANK_ICONS;

export function pickBankKey(raw: string): BankCode | undefined {
  const name = (raw ?? '').toLowerCase();
  const compact = name.replace(/[\s-]+/g, '');

  const has = (kw: string) => name.includes(kw) || compact.includes(kw);

  if (['kb', 'kookmin', '국민'].some(has)) return 'kb';
  if (['shinhan', 'sinhan', '신한'].some(has)) return 'shinhan';
  if (['hana', 'keb', '하나'].some(has)) return 'hana';
  if (['woori', '우리'].some(has)) return 'woori';
  if (['ibk', '기업'].some(has)) return 'ibk';
  if (['nonghyup', '농협'].some(has)) return 'nonghyup';
  if (['kakaobank', 'kakao', '카카오'].some(has)) return 'kakaobank';
  if (['kbank', '케이뱅크', '케뱅'].some(has)) return 'kbank';
  if (['toss', '토스'].some(has)) return 'toss';
  if (['standard chartered', 'standardchartered', 'sc제일', 'sc'].some(has)) return 'sc';
  if (['citi', 'citibank', '씨티'].some(has)) return 'citi';
  if (['kdb', '산업', 'korea development'].some(has)) return 'kdb';
  if (['post', 'postoffice', '우체국'].some(has)) return 'post';
  if (['saemaul', '새마을', 'newvillage'].some(has)) return 'saemaul';
  if (['suhyup', 'soohyup', '수협'].some(has)) return 'suhyup';
  if (['shinhyup', 'sinhyup', '신협'].some(has)) return 'shinhyup';
  if (['bnk', 'busan', '부산', '경남', 'gyeongnam', 'kyongnam'].some(has)) return 'bnk';
  if (['sbi'].some(has)) return 'sbi';
  if (['im'].some(has)) return 'im';
  if (['rado', '광주', '전북'].some(has)) return 'rado'; // 무엇인지 확정되면 변경
  if (['현대', 'Hyundai'].some(has)) return 'hyundai';
  if (['BC', '비씨'].some(has)) return 'bc';
  if (['삼성', 'Samsung', 'samsung'].some(has)) return 'samsung';
  if (['롯데', 'lotte', 'Lotte'].some(has)) return 'lotte';

  return undefined;
}

export const BankOrCardIcon = ({ name, scale }: { name: string, scale: number }) => {
  const key = pickBankKey(name);
  const SelectedIcon = key ? BANK_ICONS[key] : undefined;

  if (SelectedIcon) {
    return <SelectedIcon className={`scale-${scale}`} />
  }
  // 기본 아이콘(없을 때)
  return (
    <div/>
  );
};
