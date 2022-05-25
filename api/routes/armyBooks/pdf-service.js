import axios from 'axios';
import * as armyBookService from './army-book-service';

export async function getOrCreate(armyBookUid, armyBook) {
  let pdfByteArray;

  const start = Date.now();
  const pdf = await armyBookService.readPdfA4(armyBookUid);
  const duration = Date.now() - start;
  console.info(`PDF binary retrieval took ${duration}ms.`);

  if (pdf && pdf.createdAt) {
    if (new Date(pdf.createdAt).toISOString() == new Date(armyBook.modifiedAt).toISOString()) {
      pdfByteArray = pdf.byteArray;
    }
  }

  if (!pdfByteArray) {
    console.info(`[${armyBook.name}]#${armyBook.uid} :: No PDF found since ${armyBook.modifiedAt}. Fetching ${armyBookUid} from service provider...`);

    let res;
    let serviceName = 'unknown';
    // eslint-disable-next-line prefer-const
    try {
      res = await generateViaHtml2pdf(armyBookUid);
      serviceName = 'Html2pdf';
    } catch (e) {
      console.warn('Could not fetch PDF via Html2pdf, use fallback Sejda ->', e.message);
      res = await generateViaSejda(armyBookUid);
      serviceName = 'Sejda';
    }

    if (res) {
      pdfByteArray = res.data;
      console.info(`[${armyBook.name}] #${armyBook.uid} :: Save pdf, ${pdfByteArray.length} bytes ...`);
      await armyBookService.savePdfA4(armyBookUid, pdfByteArray, new Date(armyBook.modifiedAt.toISOString()), serviceName);
    } else {
      console.error(`[${armyBook.name}] #${armyBook.uid} :: PDF could not be generated!`);
    }
  } else {
    console.info(`[${armyBook.name}] #${armyBook.uid} :: PDF found.`);
  }
  return pdfByteArray;
}

export async function generateViaHtml2pdf(armyBookUid) {
  const params = {
    url: `https://webapp.onepagerules.com/army-books/view/${armyBookUid}/print`,
    apiKey: process.env.HTML2PDF_API_KEY,
    media: 'print',
  };
  const res = await axios.get('https://api.html2pdf.app/v1/generate',
    {
      params,
      responseType: 'arraybuffer',
    },
  );
  return res;
}

/**
 * https://www.sejda.com/developers#html-pdf-api
 */
export async function generateViaSejda(armyBookUid) {
  try {
    const res = await axios.post('https://api.sejda.com/v2/html-pdf',
      {
        url: `https://webapp.onepagerules.com/army-books/view/${armyBookUid}/print`,
        pageSize: 'a4',
        pageOrientation: 'portrait',
        usePrintMedia: true,
        filename: 'some.pdf',
      },
      {
        headers: { Authorization: `Token: ${process.env.PDF_SEJDA_API_KEY}` },
        responseType: 'arraybuffer',
      },
    );
    return res;
  } catch (e) {
    console.error('PDF generation via api.sejda.com failed ->', e.message);
  }
  return null;
}

/**
 * @see https://pdflayer.com/
 */
export async function generateViaPdfLayer(armyBookUid) {
  const params = {
    document_url: `https://webapp.onepagerules.com/army-books/view/${armyBookUid}/print`,
    access_key: '360c4dff78db1f785400ba07f404578b',
    page_size: 'A4',
    custom_unit: 'mm',
    orientation: 'portrait',
    use_print_media: 1,
    test: 1,
    force: 1,
    margin_top: 0,
    margin_bottom: 0,
    margin_left: 0,
    margin_right: 0,
  };
  const res = await axios.get('https://api.pdflayer.com/api/convert',
    {
      params,
      responseType: 'arraybuffer',
    },
  );
  return res;
}

/*+
 * @see https://htmlpdfapi.com/
 * - cover image missing
 * - output not usable
 */
export async function generateViaHtmlpdfapi(armyBookUid) {
  const params = {
    url: `https://webapp.onepagerules.com/army-books/view/${armyBookUid}/print`,
    page_size: 'A4',
    use_print_media_type: true,
    smart_shrinking: false,
    javascript_delay: 800,
    viewport_size: '1280x800',
  };
  try {
    const res = await axios.post('https://htmlpdfapi.com/api/v1/pdf',
      params,
      {
        headers: { Authentication: 'Token __R0OJbg5IdqTTx1B1PHNEEEdktIcrHE' },
        responseType: 'arraybuffer',
      },
    );
    return res;
  } catch (e) {
    console.error('PDF generation via htmlpdfapi.com failed ->', e.message);
  }
 return null;
}
