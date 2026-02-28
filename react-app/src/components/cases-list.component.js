import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CaseDataService from "../services/case.service";
import CourseDataService from "../services/course.service";
import SchoolDataService from "../services/school.service";
import Pagination from "@material-ui/lab/Pagination";
import AuthService from "../services/auth.service";
import "./case-management.css";

const emptyForm = {
  description: "",
  courseId: "",
  schoolId: "",
};

const CasesList = () => {
  const [cases, setCases] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchCourseId, setSearchCourseId] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSubcategory, setSearchSubcategory] = useState("");
  const canEdit = AuthService.isVolunteer();
  const stylishPublic = !AuthService.isLogin();

  const retrieveAll = useCallback(async () => {
    try {
      const [casesResp, coursesResp, schoolsResp] = await Promise.all([
        CaseDataService.getAll({
          page: page - 1,
          size: pageSize,
          keyword: keyword || undefined,
          courseId: searchCourseId || undefined,
          category: searchCategory || undefined,
          subcategory: searchSubcategory || undefined,
        }),
        CourseDataService.getAll({ size: 200 }),
        SchoolDataService.getAllSimple(),
      ]);
      setCases(casesResp.data.cases || []);
      setTotalPages(casesResp.data.totalPages || 0);
      setTotalItems(casesResp.data.totalItems || 0);
      setCourses(coursesResp.data.courses || []);
      setSchools(schoolsResp.data || []);
    } catch (e) {
      console.log(e);
      setMessage("加载案例数据失败。");
    }
  }, [keyword, page, pageSize, searchCourseId, searchCategory, searchSubcategory]);

  useEffect(() => {
    retrieveAll();
  }, [retrieveAll]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        description: form.description,
        courseId: Number(form.courseId),
        schoolId: form.schoolId ? Number(form.schoolId) : null,
      };
      if (editingId) {
        await CaseDataService.update(editingId, payload);
        setMessage("案例更新成功。");
      } else {
        await CaseDataService.create(payload);
        setMessage("案例创建成功。");
      }
      setEditingId(null);
      setForm(emptyForm);
      retrieveAll();
    } catch (err) {
      setMessage(err?.response?.data?.message || "保存失败。");
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      description: item.description || "",
      courseId: item.courseId || "",
      schoolId: item.schoolId || (item.school ? item.school.id : ""),
    });
  };

  const onDelete = async (item) => {
    const ok = window.confirm("此操作将永久删除该案例及其所有附件，且无法撤销。确定继续吗？");
    if (!ok) return;
    try {
      await CaseDataService.delete(item.id, true);
      setMessage("案例删除成功。");
      retrieveAll();
    } catch (err) {
      setMessage(err?.response?.data?.message || "删除失败。");
    }
  };

  const onSearch = () => {
    setPage(1);
    retrieveAll();
  };

  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];
  const subcategories = [...new Set(courses.map((c) => c.subcategory).filter(Boolean))];

  return (
    <div className={`container ${stylishPublic ? "cm-page" : ""}`}>
      {stylishPublic ? <div className="cm-hero">
        <h4 className="cm-title">案例管理</h4>
        <p className="cm-subtitle">公开浏览案例与附件，按课程分类快速筛选。</p>
        <div className="cm-kpis">
          <span className="cm-kpi">总案例数：{totalItems}</span>
          <span className="cm-kpi">当前页：{page}/{totalPages || 1}</span>
        </div>
      </div> : <h4>案例管理（总数：{totalItems}）</h4>}

      <div className={stylishPublic ? "cm-card" : "mb-3"}>
      <div className="input-group">
        <input
          className="form-control"
          placeholder="按案例描述或课程标题搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={onSearch}>
            搜索
          </button>
        </div>
      </div>
      </div>
      <div className={stylishPublic ? "cm-card" : "mb-3"}>
      <div className="form-row">
        <div className="form-group col-md-4">
          <label>课程筛选</label>
          <select
            className="form-control"
            value={searchCourseId}
            onChange={(e) => setSearchCourseId(e.target.value)}
          >
            <option value="">全部课程</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-md-4">
          <label>分类筛选</label>
          <select
            className="form-control"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group col-md-4">
          <label>子分类筛选</label>
          <select
            className="form-control"
            value={searchSubcategory}
            onChange={(e) => setSearchSubcategory(e.target.value)}
          >
            <option value="">全部子分类</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
      {canEdit && <form onSubmit={onSubmit} className={stylishPublic ? "cm-card" : "mb-3"}>
        <div className="form-row">
          <div className="form-group col-md-5">
            <label>案例描述</label>
            <input
              className="form-control"
              name="description"
              value={form.description}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group col-md-3">
            <label>所属课程</label>
            <select className="form-control" name="courseId" value={form.courseId} onChange={onChange} required>
              <option value="">请选择课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-4">
            <label>关联学校（可为空）</label>
            <select
              className="form-control"
              name="schoolId"
              value={form.schoolId}
              onChange={onChange}
            >
              <option value="">不关联学校</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.code} - {school.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary mr-2" type="submit">
          {editingId ? "更新案例" : "新增案例"}
        </button>
        {editingId && (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            取消编辑
          </button>
        )}
      </form>}

      {message && <div className="alert alert-info py-2">{message}</div>}

      <div className={stylishPublic ? "cm-table-wrap" : ""}>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>描述</th>
            <th>课程</th>
            <th>关联学校</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.description}</td>
              <td>
                {stylishPublic
                  ? item.course ? item.course.title : <span className="cm-tag cm-tag-warn">未设置</span>
                  : (item.course ? item.course.title : "-")}
              </td>
              <td>
                {stylishPublic
                  ? (
                    item.school
                      ? <span className="cm-tag">{`${item.school.code}-${item.school.name}`}</span>
                      : item.schools && item.schools[0]
                        ? <span className="cm-tag">{`${item.schools[0].code}-${item.schools[0].name}`}</span>
                        : <span className="cm-tag cm-tag-warn">未关联</span>
                  )
                  : (
                    item.school
                      ? `${item.school.code}-${item.school.name}`
                      : item.schools && item.schools[0]
                        ? `${item.schools[0].code}-${item.schools[0].name}`
                        : "-"
                  )}
              </td>
              <td>
                <Link className="btn btn-link p-0 mr-2" to={`/cases/${item.id}`}>
                  详情
                </Link>
                {canEdit ? (
                  <>
                    <button className="btn btn-link p-0 mr-2" onClick={() => onEdit(item)}>
                      编辑
                    </button>
                    <button className="btn btn-link p-0 text-danger" onClick={() => onDelete(item)}>
                      删除
                    </button>
                  </>
                ) : (
                  <span className="text-muted">只读</span>
                )}
              </td>
            </tr>
          ))}
          {cases.length === 0 && (
            <tr>
              <td colSpan="5" className={stylishPublic ? "cm-empty" : ""}>暂无案例数据</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <div className="mt-2 d-flex align-items-center">
        <label className="mr-2 mb-0">每页条数</label>
        <select
          className="form-control form-control-sm"
          style={{ width: "100px" }}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      <Pagination
        className="my-3"
        count={totalPages || 1}
        page={page}
        siblingCount={1}
        boundaryCount={1}
        onChange={(event, value) => setPage(value)}
      />
    </div>
  );
};

export default CasesList;
