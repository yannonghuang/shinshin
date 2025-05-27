import React from "react";
import SchoolDataService from "../services/school.service";
import ProjectDataService from "../services/project.service";
import { Link } from "react-router-dom";

//import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import AuthService from "../services/auth.service";
import { isMobile } from 'react-device-detect';

import * as echarts from 'echarts';
import { chinaMapConfig } from "../geo/config";
import { geoJson } from "../geo/geojsonlocal.js";
import { importJSON } from "../geo/import-json.js";
import queryString from 'query-string';

const MapShow = (props) => {

  const [loading, setLoading] = useState(true);

  const [regions, setRegions] = useState([]);

  const qString = props.location ? queryString.parse(props.location.search) : null;
  const [region, setRegion] = useState(qString ? qString.region: null);


  const [mapData, setMapData] = useState([]);
  const [mapDataMax, setMapDataMax] = useState(0);
  const [schoolsTotal, setSchoolsTotal] = useState(0);

  /*
  const [currentRegion, setCurrentRegion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [responseId, setResponseId] = useState(props.match? props.match.params.responseId : props.responseId);
  //const [responseId, setResponseId] = useState(props.match.params.responseId);
  const [distribution, setDistribution] = useState(window.location.pathname.includes('regionsDist'));
  const [navigation, setNavigation] = useState(window.location.pathname.includes('DistNav'));
  */
 
  const regionsRef = useRef();
  regionsRef.current = regions;

  const [geoJSON, setGeoJSON] = useState(null);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(40);

  const pageSizes = [5, 10, 40];
/**
  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };
*/

  const getRequestParams = (page, pageSize, region) => {
    let params = {};

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    if (region) {
      params["region"] = region;
    }

    return params;
  };

  const [regionsFull, setRegionsFull] = useState([]);

  const getRegionsFull = () => {
    SchoolDataService.getRegions()
      .then(response => {
        setRegionsFull(response.data);
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      });
  }

  useEffect(getRegionsFull, []);

  const getRegion = (shortName) => {

    //if (shortName === '湘西') return "湖南省湘西州";

    for (var i = 0; i < regionsFull.length; i++)
      if (regionsFull[i].includes(shortName))
        return regionsFull[i];

    return null;
  }

  const buildMapData = (/*regions*/) => {
    if (!regions || !geoJSON || !geoJSON.features) return;

    console.log(regions);

    let mData = [];
    let mMax = 0;
    let schoolsTotal = 0;
    for (var i = 0; i < regions.length; i++) {
      let rName = '';
      if (!region) { // configure map for regions
        if (regions[i].region.startsWith('内蒙古')) rName = '内蒙古';
        else if (regions[i].region.startsWith('黑龙江')) rName = '黑龙江';
        //else if (regions[i].region.includes('湘西')) rName = '湘西';
        else rName = regions[i].region.substring(0, 2);
      } else { // configure map for cities
        //console.info('looking for rName ...');

        for (var j = 0; j < geoJSON.features.length; j++) {
          if (geoJSON.features[j].properties.fullname.includes(regions[i].city.substring(0, 2)) ||
              geoJSON.features[j].properties.name.includes(regions[i].city.substring(0, 2))
            ) {
            rName = geoJSON.features[j].properties.name;
            break;
          }
        }
        //console.info('rName = ' + rName)

        //rName = regions[i].city.substring(0, 2);
      }

      mData.push({name: rName, value: regions[i].schoolsCount});

      if (regions[i].schoolsCount > mMax) mMax = regions[i].schoolsCount;

      schoolsTotal += regions[i].schoolsCount;
    }

    setMapData(mData);
    setMapDataMax(mMax);
    setSchoolsTotal(schoolsTotal);
  }
  useEffect(buildMapData, [regions, geoJSON]);

  const retrieveRegions = () => {
    const params = getRequestParams(page, pageSize, region);

    SchoolDataService.getCountsByRegion(params)
      .then(response => {

        const { schools, totalPages } = response.data;

        setRegions(schools);
        setCount(totalPages);

        console.log(response.data);

        //buildMapData(schools);
      })
      .catch((e) => {

        console.log(e);
      });
  };

  useEffect(retrieveRegions, [region]);

  const refreshList = () => {
    retrieveRegions();
  };

  const ref = useRef(null);
  const mapInstanceRef = useRef(null);
  let mapInstance = null;

  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        console.log('region = ' + region);
        const gj = await importJSON(region /*'https://geojson.cn/api/china/100000.json'*/);
        setGeoJSON(gj);

      } catch (error) {
        console.error("Failed to load GeoJSON:", error);
      }
    };

    loadMap();

    return () => {
      isMounted = false;
    };
  }, [/*mapData, mapDataMax, schoolsTotal, regionsFull*/]);

  useEffect(() => {
    let isMounted = true;

    const renderMap = async () => {
      try {
        if (!isMounted) return;
        if (!geoJSON) return;

        // Register the map after loading
        //echarts.registerMap(region ? region : "china", gj);
        echarts.registerMap(region ? region : "china", geoJSON);

        // Initialize or get existing chart instance
        let mapInstance = mapInstanceRef.current;
        if (!mapInstance && ref.current) {
          mapInstance = echarts.init(ref.current);
          mapInstanceRef.current = mapInstance;

          mapInstance.on('click', (params) => {
            if (params.name) {
              const r = getRegion(params.name);
              //if (r) window.open("/schools/region/" + r, '_blank');
              if (r) 
                window.open("/regionsDistNav?region=" + r, '_blank'); 
              else
                window.open("/schools/city/" + params.name, '_blank');
            }
          });
        }

        // Set the chart option
        mapInstance.setOption(
          chinaMapConfig({ data: mapData, max: mapDataMax, min: 0, total: schoolsTotal, region })
        );

        setLoading(false);

      } catch (error) {
        console.error("Failed or render GeoJSON:", error);
      }
    };

    renderMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
    };
  }, [mapData, mapDataMax, schoolsTotal, geoJSON]);

  useEffect(() => {

    setRegion(qString ? qString.region: null);
    console.log("region = " + region);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
    };
  }, []);


  return (<div>

    <div hidden={loading} style={{ width: "100%", height: "99vh" }} ref={ref}></div>
    <div hidden={!loading} ><p>loading ... </p></div>

  </div>)};

export default MapShow;