import { meta } from "./_meta.js";

const url_prefix = 'https://geojson.cn/api/china/';

export async function importJSON(region = null) {
  try {
    const url = getUrl(region);
    console.log(url);
    const response = await fetch(url /*'https://api.example.com/data.json'*/);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data; 
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function getUrl(region = null) {
  if (!region) return url_prefix + meta.files[0].filename + '.json';

  for (let i = 0; i < meta.files[0].children.length; i++) {
    if (meta.files[0].children[i].name.includes(region.substring(0, 3))) return url_prefix + meta.files[0].children[i].filename + '.json';
  }

}