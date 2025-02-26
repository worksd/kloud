'use server'
import CryptoJS from "crypto-js";

interface Message {
  to: string;
  subject?: string;
  content?: string;
}

interface FileInfo {
  fileId: string;
}

interface SMSRequest {
  type: 'SMS' | 'LMS' | 'MMS';
  contentType: 'COMM' | 'AD';
  countryCode: string;
  from: string;
  subject?: string;
  content: string;
  messages: Message[];
  files?: FileInfo[];
  reserveTime?: string;
  reserveTimeZone?: string;
}

function makeSignature(timeStamp: string): string {
  const space = " ";				// one space
  const newLine = "\n";				// new line
  const method = "POST";				// method
  const url = `/sms/v2/services/${process.env.NCP_SMS_SERVICE_ID}/messages`;	// url (include query string)
  const timestamp = timeStamp;			// current timestamp (epoch)
  const accessKey = process.env.NCP_ACCESS_KEY_ID || '';			// access key id (from portal or Sub Account)
  const secretKey = process.env.NCP_SECRET_KEY || '';			// secret key (from portal or Sub Account)

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);

  const hash = hmac.finalize();

  return hash.toString(CryptoJS.enc.Base64);
}

const sendSMS = async (serviceId: string, request: SMSRequest) => {
  try {
    const now = Date.now().toString()
    console.log(now)
    console.log(process.env.NCP_ACCESS_KEY_ID)
    const response = await fetch(
      `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': now,
          'x-ncp-iam-access-key': process.env.NCP_ACCESS_KEY_ID || '',
          'x-ncp-apigw-signature-v2': makeSignature(now)
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      console.log(await response.json())
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data;

  } catch (error) {
    console.error('SMS 전송 실패:', error);
  }
};

// 사용 예시
export const sendVerificationSMS = async ({phone, code} : {phone: string, code: number}) => {
  console.log(`phone = ${phone} code = ${code}`)
  const request: SMSRequest = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: '01084793302',
    content: `Rawgraphy 본인인증번호는 [${code}] 입니다.`,
    messages: [
      {
        to: phone
      }
    ]
  };
  return await sendSMS(process.env.NCP_SMS_SERVICE_ID ?? '', request);
};