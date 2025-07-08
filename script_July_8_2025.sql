update schools
set xr = 1
where exists (
  select *
  from projects 
  where projects.schoolId = schools.id and projects.xr = 1
)
