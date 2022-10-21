CREATE TABLE Draft
(
    id INT IDENTITY PRIMARY KEY,
    address NVARCHAR(128) NOT NULL,
    duedate NVARCHAR(36),
    comment NVARCHAR(128),
    prio NVARCHAR(128) ,
)
