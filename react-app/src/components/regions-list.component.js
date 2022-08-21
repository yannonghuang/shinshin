import React, { Component } from "react";
import SchoolDataService from "../services/school.service";
import { Link } from "react-router-dom";
import Pagination from "@material-ui/lab/Pagination";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTable, useSortBy } from "react-table";

import * as echarts from 'echarts';
import { chinaMapConfig } from "./config";
import { geoJson } from "./geojson.js";

const RegionsList = (props) => {

  const [regions, setRegions] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [mapDataMax, setMapDataMax] = useState(0);

  const [currentRegion, setCurrentRegion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchOriginalname, setSearchOriginalname] = useState("");
  const [responseId, setResponseId] = useState(props.match? props.match.params.responseId : props.responseId);
  //const [responseId, setResponseId] = useState(props.match.params.responseId);

  const regionsRef = useRef();
  regionsRef.current = regions;

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const pageSizes = [5, 10, 20];

  const onChangeSearchOriginalname = (e) => {
    const searchOriginalname = e.target.value;
    setSearchOriginalname(searchOriginalname);
  };

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

  const RegionsFull = [
    "黑龙江省",
    "吉林省",
    "辽宁省",
    "陕西省",
    "青海省",
    "甘肃省",
    "湖南省",
    "湖南省湘西州",
    "湖北省",
    "四川省",
    "贵州省",
    "山东省",
    "山西省",
    "江西省",
    "江苏省",
    "安徽省",
    "河南省",
    "云南省",
    "福建省",
    "海南省",
    "重庆市",
    "广西壮族自治区",
    "内蒙古自治区",
    "宁夏回族自治区",
    "新疆维吾尔族自治区",
    "西藏自治区",
  ];

  const getRegionsFull = async () => {
    if (!regionsFull || regionsFull.length === 0) {
      try {
        let response = await SchoolDataService.getRegions()

        setRegionsFull(response.data);
        console.log(response);
      } catch(e) {
        console.log(e);
      };
    }
    return regionsFull;
  }

  //useEffect(getRegionsFull, []);

  const getRegion = async (shortName) => {

    if (shortName === '湘西') return "湖南省湘西州";

    let regionsFull = await getRegionsFull();
    for (var i = 0; i < RegionsFull.length; i++)
      if (RegionsFull[i].includes(shortName))
        return RegionsFull[i];

    return null;
  }

  const buildMapData = (schools) => {
    if (!schools) return;

    let mData = [];
    let mMax = 0;
    for (var i = 0; i < schools.length; i++) {
      let rName = '';
      if (schools[i].region.startsWith('内蒙古')) rName = '内蒙古';
      else if (schools[i].region.startsWith('黑龙江')) rName = '黑龙江';
      else if (schools[i].region.includes('湘西')) rName = '湘西';
      else rName = schools[i].region.substring(0, 2);

      mData.push({name: rName, value: schools[i].schoolsCount});
      //mData.push({name: rName, value: schools[i].schoolsCount, region: schools[i].region});

      if(schools[i].schoolsCount > mMax) mMax = schools[i].schoolsCount;
    }

    setMapData(mData);
    setMapDataMax(mMax);
  }

  const retrieveRegions =  () => {
    const params = getRequestParams(page, pageSize);

    SchoolDataService.getCountsByRegion(params)
      .then(async (response) => {

        const { schools, totalPages } = response.data;

        setRegions(schools);
        setCount(totalPages);

        console.log(response.data);

        await getRegionsFull();
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

  const findByOriginalname = () => {
    setPage(1);
    retrieveRegions();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };


  const ref = useRef(null);
  let mapInstance = null;

  const renderMap = () => {
    const renderedMapInstance = echarts.getInstanceByDom(ref.current);
    if (renderedMapInstance) {
      mapInstance = renderedMapInstance;
    } else {
      mapInstance = echarts.init(ref.current);
    }
    mapInstance.setOption(
      chinaMapConfig({ data: mapData, max: mapDataMax, min: 0 })
    );

    mapInstance.on('click', async (params) => {
      if (params.name) {
        let r = await getRegion(params.name);
        props.history.push("/schools/region/" + r);
        //props.history.push("/schools/region/" + params.data.region);
        }
    });

  };

  useEffect(() => {
    echarts.registerMap("china", { geoJSON: geoJson });
    renderMap();
  }, [mapDataMax, mapData]);

/**
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
    <div style={{ width: "100%", height: "99vh" }} ref={ref}></div>

    <div className="list row">
      <div className="col-sm-8">
        <h4>地区列表</h4>
{/*
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by originalname"
            value={searchOriginalname}
            onChange={onChangeSearchOriginalname}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByOriginalname}
            >
              Search
            </button>
          </div>
        </div>
*/}
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