import { meta } from "./_meta.js";
import GeoDataService from "../services/geo.service.js";

const url_prefix = 'https://geojson.cn/api/china/';

export async function importJSON(region = null) {
  try {
    const filename = getFilename(region);

    let data = await loadLocal(filename);

    if (!data) {
      console.log("Using remote map data .....");

      const url = getUrl(region);
      console.log(url);
      const response = await fetch(url /*'https://api.example.com/data.json'*/);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      data = await response.json();

      await saveLocal(data, filename);
    }
    console.log(data);
    return data; 
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function _loadLocal(filename) {
  try {
    let res = await GeoDataService.download(filename);
    if (res.status === 500) return null;

    let data = await res.json();
    return data;
  } catch (error) {
    console.info('Error loading local data:', error);
  }
  return null;
}


 async function loadLocal(filename) {
  try {
    const res = await fetch(`/api/geo/download/${filename}`);
    if (res.status === 500) return null;

    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}


async function saveLocal(data, filename) {
  try {
    await GeoDataService.upload(data, filename);
  } catch (error) {
    console.info('Error uploading local data:', error);
  }
}

function _getUrl(region = null) {
  if (!region) return url_prefix + meta.files[0].filename + '.json';

  for (let i = 0; i < meta.files[0].children.length; i++) {
    if (meta.files[0].children[i].name.includes(region.substring(0, 3))) return url_prefix + meta.files[0].children[i].filename + '.json';
  }
}

function getUrl(region = null) {
  return url_prefix + getFilename(region) + '.json';
}

function getFilename(region = null) {
  if (!region) return meta.files[0].filename;

  for (let i = 0; i < meta.files[0].children.length; i++) {
    if (meta.files[0].children[i].name.includes(region.substring(0, 3))) return meta.files[0].children[i].filename;
  }
}

export function getCities(region) {
  let result = [];
  if (!region) return result;

  let cities = null;
  for (let i = 0; i < meta.files[0].children.length; i++) {
    if (meta.files[0].children[i].name.includes(region.substring(0, 3))) {
      cities = meta.files[0].children[i].children;
      break;
    }
  }
  if (cities)
    for (var i = 0; i < cities.length; i++) {
      if (cities[i].name.includes('湘西'))
        result.push('湘西');

      else if (cities[i].name.includes('梁平'))
        result.push('梁平');

      else if (cities[i].name.includes('博尔塔拉蒙古自治州'))
        result.push('博州');

      else result.push(cities[i].name);

    }

  return result;  
}
