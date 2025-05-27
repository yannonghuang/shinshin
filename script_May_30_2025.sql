update nodedb.schools
set region = '湖南省'
where id > 0 and region = '湖南省湘西州';

update nodedb.schools
set city = county
where region like '%重庆%' and id > 0;

update nodedb.schools
set city = '梁平区'
where region like '%重庆%' and city = '梁平县' and id > 0;

update nodedb.schools
set city = '博州'
where region like '%新疆%' and city = '博尔塔拉蒙古自治州' and id > 0;

update nodedb.schools
set city = trim(city)
where id > 0;

update nodedb.schools
set city = '哈尔滨市'
where id > 0 and city = '哈尔滨';