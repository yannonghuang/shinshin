import React, { useCallback, useEffect, useState } from "react";
import CourseDataService from "../services/course.service";
import Pagination from "@material-ui/lab/Pagination";
import AuthService from "../services/auth.service";
import "./case-management.css";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
};

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const canEdit = AuthService.isVolunteer();
  const stylishPublic = !AuthService.isLogin();

  const retrieveCourses = useCallback(async () => {
    try {
      const response = await CourseDataService.getAll({
        page: page - 1,
        size: pageSize,
        keyword: keyword || undefined,
      });
      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalItems(response.data.totalItems || 0);
    } catch (e) {
      console.log(e);
      setMessage("加载课程失败。");
    }
  }, [keyword, page, pageSize]);

  useEffect(() => {
    retrieveCourses();
  }, [retrieveCourses]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await CourseDataService.update(editingId, form);
        setMessage("课程更新成功。");
      } else {
        await CourseDataService.create(form);
        setMessage("课程创建成功。");
      }
      setForm(emptyForm);
      setEditingId(null);
      retrieveCourses();
    } catch (err) {
      setMessage(err?.response?.data?.message || "保存失败。");
    }
  };

  const onEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      subcategory: course.subcategory || "",
    });
  };

  const onDelete = async (course) => {
    if (!window.confirm(`确定删除课程「${course.title}」吗？`)) return;
    try {
      await CourseDataService.delete(course.id);
      setMessage("课程删除成功。");
      retrieveCourses();
    } catch (err) {
      setMessage(err?.response?.data?.message || "删除失败。");
    }
  };

  const onSearch = () => {
    setPage(1);
    retrieveCourses();
  };

  return (
    <div className={`container ${stylishPublic ? "cm-page" : ""}`}>
      {stylishPublic ? <div className="cm-hero">
        <h4 className="cm-title">课程管理</h4>
        <p className="cm-subtitle">公开展示课程目录，支持中文关键词检索。</p>
        <div className="cm-kpis">
          <span className="cm-kpi">总课程数：{totalItems}</span>
          <span className="cm-kpi">当前页：{page}/{totalPages || 1}</span>
        </div>
      </div> : <h4>课程管理（总数：{totalItems}）</h4>}

      <div className={stylishPublic ? "cm-card" : "mb-3"}>
        <div className="input-group">
        <input
          className="form-control"
          placeholder="按标题/描述/分类搜索"
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

      {canEdit && <form onSubmit={onSubmit} className={stylishPublic ? "cm-card" : "mb-3"}>
        <div className="form-row">
          <div className="form-group col-md-3">
            <label>标题</label>
            <input className="form-control" name="title" value={form.title} onChange={onChange} required />
          </div>
          <div className="form-group col-md-3">
            <label>分类</label>
            <input className="form-control" name="category" value={form.category} onChange={onChange} />
          </div>
          <div className="form-group col-md-3">
            <label>子分类</label>
            <input className="form-control" name="subcategory" value={form.subcategory} onChange={onChange} />
          </div>
          <div className="form-group col-md-3">
            <label>描述</label>
            <input className="form-control" name="description" value={form.description} onChange={onChange} />
          </div>
        </div>
        <button className="btn btn-primary mr-2" type="submit">
          {editingId ? "更新课程" : "新增课程"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-secondary"
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
            <th>标题</th>
            <th>分类</th>
            <th>子分类</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.title}</td>
              <td>
                {stylishPublic
                  ? course.category
                    ? <span className="cm-tag">{course.category}</span>
                    : <span className="cm-tag cm-tag-warn">未设置</span>
                  : (course.category || "-")}
              </td>
              <td>
                {stylishPublic
                  ? course.subcategory
                    ? <span className="cm-tag">{course.subcategory}</span>
                    : <span className="cm-tag cm-tag-warn">未设置</span>
                  : (course.subcategory || "-")}
              </td>
              <td>{course.description}</td>
              <td>
                {canEdit ? (
                  <>
                    <button className="btn btn-link p-0 mr-2" onClick={() => onEdit(course)}>
                      编辑
                    </button>
                    <button className="btn btn-link p-0 text-danger" onClick={() => onDelete(course)}>
                      删除
                    </button>
                  </>
                ) : (
                  <span className="text-muted">只读</span>
                )}
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan="6" className={stylishPublic ? "cm-empty" : ""}>暂无课程数据</td>
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

export default CoursesList;
