# SQL

## 查询重复数据

~~~sql
-- 假定table为tb1
-- 单列col1重复的数据
select * from tb1 where tb1.col1 in (
  select col1 from tb1 group by col1 having count(col1) > 1
);

-- 多列组合作为唯一键，比如：col1 + col2组合唯一
select * from (
  -- 子查询，查出所有数据（或其他需要的列数据）、uk列，作为临时表 t
  select *, concat(col1, col2) as uk1 from tb1 
) t
-- 在临时表t中，可加条件过滤
where 
t.uk1 in (
  -- 子查询，根据组合键找出重复的列，作为临时表tt
  select uk from (
    select concat(col1, col2) as uk from tb1 group by uk having count(uk) > 1
  ) tt
);
~~~

## 删除重复数据

支持以业务列单列或多列组合为唯一键，删除重复的数据

~~~sql
-- 假定table为 tb1，以业务列为col1去重
delete from tb1 where id not in (
  select maxId from (select max(id) as maxId, col1 from tb1 group by col1) t
);

-- 假定table为tb1，业务列 （col1 、col2）组合 唯一，去重
delete from tb1 where id not in (
  select maxId from (
    -- 子查询，查出最大的ID
    select max(id) as maxId, concat(col1, col2) as uk from tb1 group by uk
  ) t
);
~~~