import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import CaseDataService from "../services/case.service";
import SchoolDataService from "../services/school.service";
import Pagination from "@material-ui/lab/Pagination";
import AuthService from "../services/auth.service";
import { CASE_COURSES, getCaseCategories } from "../constants/case-options";
import "./case-management.css";

const emptyForm = {
  description: "",
  year: "",
  course: "",
  category: "",
  schoolId: "",
};

const CasesList = () => {
  const [cases, setCases] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchCourse, setSearchCourse] = useState("乡土课程");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const canEdit = AuthService.isVolunteer();
  const stylishPublic = !AuthService.isLogin();

  const retrieveAll = useCallback(async () => {
    try {
      const [casesResp, schoolsResp] = await Promise.all([
        CaseDataService.getAll({
          page: page - 1,
          size: pageSize,
          keyword: keyword || undefined,
          year: searchYear || undefined,
          course: searchCourse || undefined,
          category: searchCategory || undefined,
        }),
        SchoolDataService.getAllSimple(),
      ]);
      setCases(casesResp.data.cases || []);
      setTotalPages(casesResp.data.totalPages || 0);
      setTotalItems(casesResp.data.totalItems || 0);
      setSchools(schoolsResp.data || []);
    } catch (e) {
      console.log(e);
      setMessage("加载案例数据失败。");
    }
  }, [keyword, page, pageSize, searchCourse, searchCategory, searchYear]);

  useEffect(() => {
    retrieveAll();
  }, [retrieveAll]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "course") {
      setForm((prev) => {
        const validCategories = getCaseCategories(value);
        const nextCategory = validCategories.includes(prev.category) ? prev.category : "";
        return { ...prev, course: value, category: nextCategory };
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        description: form.description,
        year: Number(form.year),
        course: form.course,
        category: form.category,
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
      setIsEditorOpen(false);
      retrieveAll();
    } catch (err) {
      setMessage(err?.response?.data?.message || "保存失败。");
    }
  };

  const openCreateEditor = () => {
    setEditingId(null);
    setForm({ ...emptyForm, year: String(new Date().getFullYear()), course: searchCourse });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      description: item.description || "",
      year: item.year ? String(item.year) : "",
      course: item.course || item.field || "",
      category: item.category || item.topic || "",
      schoolId: item.schoolId || (item.school ? item.school.id : ""),
    });
    setIsEditorOpen(true);
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

  const onFolderClick = (course) => {
    setSearchCourse(course);
    setSearchCategory("");
    setPage(1);
  };

  const searchCategoryOptions = getCaseCategories(searchCourse);
  const formCategoryOptions = getCaseCategories(form.course);
  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: `${school.code} - ${school.name}`,
  }));
  const selectedSchoolOption = schoolOptions.find((option) => String(option.value) === String(form.schoolId)) || null;

  return (
    <div className={`container ${stylishPublic ? "cm-page" : ""}`}>
      {stylishPublic ? <div className="cm-hero">
        <h4 className="cm-title">课程案例分享平台</h4>
        <p className="cm-subtitle">公开浏览案例与附件，按课程和类型快速筛选。</p>
        <div className="cm-kpis">
          <span className="cm-kpi">总案例数：{totalItems}</span>
          <span className="cm-kpi">当前页：{page}/{totalPages || 1}</span>
        </div>
      </div> : <h4>课程案例分享平台（总数：{totalItems}）</h4>}

      <div className={stylishPublic ? "cm-card" : "mb-3"}>
        <div className="cm-folder-row">
          {CASE_COURSES.map((course) => (
            <button
              key={course}
              type="button"
              className={`cm-folder-btn ${searchCourse === course ? "is-active" : ""}`}
              onClick={() => onFolderClick(course)}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      <div className={stylishPublic ? "cm-card" : "mb-3"}>
      <div className="input-group">
        <input
          className="form-control"
          placeholder="按案例描述、课程或类型搜索"
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
        <div className="form-group col-md-6">
          <label>年份筛选</label>
          <input
            className="form-control"
            type="number"
            min="1900"
            max="2100"
            placeholder="例如 2026"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
          />
        </div>
        <div className="form-group col-md-6">
          <label>类型筛选</label>
          <select
            className="form-control"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="">全部类型</option>
            {searchCategoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
      {canEdit && (
        <div className={stylishPublic ? "cm-card" : "mb-3"}>
          <button className="btn btn-primary" type="button" onClick={openCreateEditor}>
            新增案例
          </button>
        </div>
      )}

      {message && <div className="alert alert-info py-2">{message}</div>}

      <div className={stylishPublic ? "cm-table-wrap" : ""}>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>年份</th>
            <th>描述</th>
            <th>课程</th>
            <th>类型</th>
            <th>关联学校</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.year || "-"}</td>
              <td>{item.description}</td>
              <td>{stylishPublic ? <span className="cm-tag">{item.course || "-"}</span> : (item.course || "-")}</td>
              <td>{item.category || "-"}</td>
              <td>
                {stylishPublic
                  ? (
                    item.school
                      ? <span className="cm-tag">{`${item.school.code}-${item.school.name}`}</span>
                      : <span className="cm-tag cm-tag-warn">未关联</span>
                  )
                  : (
                    item.school
                      ? `${item.school.code}-${item.school.name}`
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
              <td colSpan="7" className={stylishPublic ? "cm-empty" : ""}>暂无案例数据</td>
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

      {canEdit && isEditorOpen && (
        <div className="cm-drawer-layer">
          <button className="cm-drawer-mask" type="button" onClick={closeEditor} aria-label="close editor" />
          <div className="cm-drawer-panel">
            <div className="cm-drawer-head">
              <h5 className="mb-0">{editingId ? "编辑案例" : "新增案例"}</h5>
              <button className="btn btn-link p-0" type="button" onClick={closeEditor}>关闭</button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label>年份</label>
                <input
                  className="form-control"
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.year}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>案例描述</label>
                <input
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>课程</label>
                <select className="form-control" name="course" value={form.course} onChange={onChange} required>
                  <option value="">请选择课程</option>
                  {CASE_COURSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>类型</label>
                <select
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  required
                  disabled={!form.course}
                >
                  <option value="">{form.course ? "请选择类型" : "请先选择课程"}</option>
                  {formCategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>关联学校（可为空）</label>
                <Select
                  className="form-control p-0 border-0"
                  value={selectedSchoolOption}
                  name="schoolId"
                  options={schoolOptions}
                  isClearable
                  placeholder="请选择所属学校（可搜索）"
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      schoolId: selected ? selected.value : "",
                    }))
                  }
                  filterOption={(candidate, input) =>
                    String(candidate.label || "").toLowerCase().includes(String(input || "").toLowerCase())
                  }
                />
              </div>
              <div className="d-flex">
                <button className="btn btn-primary mr-2" type="submit">
                  {editingId ? "更新案例" : "新增案例"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeEditor}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesList;
