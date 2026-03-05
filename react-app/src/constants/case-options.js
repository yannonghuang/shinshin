export const CASE_COURSES = ["语文", "数学", "乡土课程"];

const GRADE_CATEGORIES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

export const CASE_CATEGORIES_BY_COURSE = {
  语文: GRADE_CATEGORIES,
  数学: GRADE_CATEGORIES,
  乡土课程: [
    "家乡美食与饮食文化",
    "非遗与传统手工艺",
    "乡土游戏与童年记忆",
    "传统节日与民俗活动",
    "家乡名人与文化传承",
    "植物探索与劳动实践",
    "乡土艺术与创意表达",
    "家乡物产与经济生活",
    "家乡地理与生态保护",
    "家乡历史与地方记忆",
    "民谣方言/家乡服饰/家乡特色建筑",
  ],
};

export const getCaseCategories = (course) => CASE_CATEGORIES_BY_COURSE[course] || [];

// Backward-compatible aliases for modules that still import old names.
export const CASE_FIELDS = CASE_COURSES;
export const CASE_TOPICS_BY_FIELD = CASE_CATEGORIES_BY_COURSE;
export const getCaseTopics = getCaseCategories;
