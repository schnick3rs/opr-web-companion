import axios from "axios";


export async function generateViaHtml2pdf(armyBookUid) {
  const params = {
    url: `https://webapp.onepagerules.com/army-books/view/${armyBookUid}/print`,
    apiKey: process.env.HTML2PDF_API_KEY,
    media: 'print',
  };
  const res = await axios.get('https://api.html2pdf.app/v1/generate',
    {
      params: params,
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
