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
import { geoJson } from "../geo/geojson.js";

import MapShow from "./mapshow.component.js";

const RegionsList = (props) => {

  const [regions, setRegions] = useState([]);

  //const [distribution, setDistribution] = useState(window.location.pathname.includes('regionsDist'));
  //const [navigation, setNavigation] = useState(window.location.pathname.includes('DistNav'));

  //const [mapData, setMapData] = useState([]);
  //const [mapDataMax, setMapDataMax] = useState(0);
  const [schoolsTotal, setSchoolsTotal] = useState(0);

  const [currentRegion, setCurrentRegion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [responseId, setResponseId] = useState(props.match? props.match.params.responseId : props.responseId);
  //const [responseId, setResponseId] = useState(props.match.params.responseId);

  const regionsRef = useRef();
  regionsRef.current = regions;

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

  const getRequestParams = (page, pageSize) => {
    let params = {};

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
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

    if (shortName === '湘西') return "湖南省湘西州";

    for (var i = 0; i < regionsFull.length; i++)
      if (regionsFull[i].includes(shortName))
        return regionsFull[i];

    return null;
  }


  const buildMapData = (regions) => {
    if (!regions) return;

    let mData = [];
    let mMax = 0;
    let schoolsTotal = 0;
    for (var i = 0; i < regions.length; i++) {
      let rName = '';
      if (regions[i].region.startsWith('内蒙古')) rName = '内蒙古';
      else if (regions[i].region.startsWith('黑龙江')) rName = '黑龙江';
      else if (regions[i].region.includes('湘西')) rName = '湘西';
      else rName = regions[i].region.substring(0, 2);

      mData.push({name: rName, value: regions[i].schoolsCount});

      if (regions[i].schoolsCount > mMax) mMax = regions[i].schoolsCount;

      schoolsTotal += regions[i].schoolsCount;
    }

    //setMapData(mData);
    //setMapDataMax(mMax);
    setSchoolsTotal(schoolsTotal);
  }


  const retrieveExportRegions = () => {
    const csv = ProjectDataService.exportCSV(regions, columns);
    const url = window.URL.createObjectURL(new Blob([csv]));

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download',
      'regions_export.csv'
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const retrieveRegions =  () => {
    const params = getRequestParams(page, pageSize);

    SchoolDataService.getCountsByRegion(params)
      .then(response => {

        const { schools, totalPages } = response.data;

        setRegions(schools);
        setCount(totalPages);

        console.log(response.data);

        buildMapData(schools);
      })
      .catch((e) => {

        console.log(e);
      });
  };

  useEffect(retrieveRegions, []);

  const refreshList = () => {
    retrieveRegions();
  };

  const columns = useMemo(
    () => [
      {
        Header: "省（自治区）",
        accessor: "region",
      },

      {
        Header: "学校数",
        accessor: "schoolsCount",
        Cell: (props) => {
          const rowIdx = props.row.id;
          return (
            <div>
              <Link
                to={regionsRef.current[rowIdx].region
                    ? "/schools/region/" + regionsRef.current[rowIdx].region
                    : "/schools"
                    }
                className="badge badge-success"
              >
                {regionsRef.current[rowIdx].schoolsCount}
              </Link>

            </div>
          );
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: regions,
    disableSortRemove: true,
  },
  useSortBy);

/**
  const findByOriginalname = () => {
    setPage(1);
    retrieveRegions();
  };
*/

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };


/**
  const ref = useRef(null);
  let mapInstance = null;

  const renderMap = () => {

    const renderedMapInstance = echarts.getInstanceByDom(ref.current);
    if (renderedMapInstance) {
      mapInstance = renderedMapInstance;
    } else {
      mapInstance = echarts.init(ref.current);
    }


    if (!mapInstance) {
      mapInstance = echarts.init(ref.current);

      mapInstance.on('click', (params) => {
        if (params.name) {
          let r = getRegion(params.name);
          if (r)
            window.open("/schools/region/" + r, 'School List for ' + r);
            //window.open("/schools/region/" + r, navigation ? '_blank' : '_self'); // _blank for new window, _self for current window
            //window.location.href = "/schools/region/" + r;
        }
      });

    }

    mapInstance.setOption(
      chinaMapConfig({ data: mapData, max: mapDataMax, min: 0, total: schoolsTotal })
    );

  };

  useEffect(() => {
    echarts.registerMap("china", { geoJSON: geoJson });
    renderMap();
  }, [mapDataMax, mapData, schoolsTotal, regionsFull]);



  useEffect(() => {
    window.onresize = function () {
      mapInstance.resize();
    };
    return () => {
      mapInstance && mapInstance.dispose();
    };
  }, []);
*/

  return (<div>
{/*
    <div hidden={!distribution} style={{ width: "100%", height: "99vh" }} ref={ref}></div>
*/}

{/*
    <MapShow hidden={!distribution} ></MapShow>
*/}

{/*
<iframe hidden={!distribution} src="http://localhost:8081/regionsDistribution" title="欣欣学校分布" width="100%" height="800" ></iframe>
*/}

    <div hidden={false /*distribution*/} className="list row">
      <div className="col-sm-8">
        <h4>地区列表(总数：{schoolsTotal})</h4>
        <div className="row mb-3 ml-1" hidden={!AuthService.isLogin() || isMobile}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={retrieveExportRegions}
          >
            导出
          </button>
        </div>
      </div>

      <div className="col-sm-12 list">
{/*}
        <div className="mt-3">
          {"每页显示行数: "}
          <select onChange={handlePageSizeChange} value={pageSize}>
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <Pagination
            className="my-3"
            count={count}
            page={page}
            siblingCount={1}
            boundaryCount={1}
            variant="outlined"
            shape="rounded"
            onChange={handlePageChange}
          />
        </div>
*/}

        <table
          className="table table-striped table-bordered"
          {...getTableProps()}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // Add the sorting props to control sorting. For this example
                  // we can add them into the header props
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {/* Add a sort direction indicator */}
                      <span>
                        {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                      </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>





  </div>);
};

export default RegionsList;