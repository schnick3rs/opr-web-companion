import Zip from 'adm-zip';

export function generateZip(entries = []) {
  const zip = new Zip();

  entries.forEach((entry) => {
    console.info(`Adding ${entry.name} to zip file...`);
    zip.addFile(entry.name, entry.byteArray);
  });

  return zip;
}
