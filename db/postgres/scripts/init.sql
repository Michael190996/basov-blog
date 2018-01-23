CREATE TABLE ARTICLES(
    ID Text PRIMARY KEY NOT NULL,
    Category Text NULL,
    CategoryId Text NULL,
    Keys Text NULL,
    Bookmark Text DEFAULT 'MICHAEL BASOV' NULL,
    Title Text NOT NULL,
    Description Text NOT NULL,
    Background Text NULL,
    Template Text DEFAULT 'gen-article/article-html' NOT NULL,
    Date Timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    Priority Int NOT NULL,
    Main Int NULL,
    Enable Boolean DEFAULT true NOT NULL
);

ALTER TABLE ARTICLES
	ALTER COLUMN CategoryId TYPE varchar(30),
	ALTER COLUMN Bookmark TYPE varchar(60),
	ALTER COLUMN Title TYPE varchar(50);

\d+ ARTICLES;

CREATE TABLE ARTICLES_CATEGORIES(
    Id Text PRIMARY KEY NOT NULL,
    Title Text NOT NULL,
    Template Text DEFAULT 'blog' NOT NULL
);

ALTER TABLE ARTICLES_CATEGORIES
	ALTER COLUMN Id TYPE varchar(30);

INSERT INTO ARTICLES_CATEGORIES VALUES
	('trip', 'Трипы', 'blog'),
	('exp', 'Публикации', 'exp'),
	('mind', 'Мысли', 'blog');

\d+ ARTICLES_CATEGORIES;

CREATE TABLE SLIDES(
    ID Serial PRIMARY KEY NOT NULL,
    Category Text NULL,
    Href Text NOT NULL,
    Title Text NOT NULL,
    Background Text NOT NULL,
    Bookmark Text DEFAULT 'MICHAEL BASOV' NULL,
    Position Text DEFAULT '50% 50%' NOT NULL,
    Classes Text DEFAULT 'block-left' NOT NULL,
    Date Timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE SLIDES
	ALTER COLUMN Category TYPE varchar(30),
	ALTER COLUMN Position TYPE varchar(10),
	ALTER COLUMN Bookmark TYPE varchar(60),
	ALTER COLUMN Title TYPE varchar(50);

\d+ SLIDES;

CREATE TABLE PHOTOS(
    ID Serial PRIMARY KEY NOT NULL,
    AlbumId Text NULL,
    Title Text NOT NULL,
    Description Text NULL,
    Src Text NOT NULL,
    Date Timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE PHOTOS
	ALTER COLUMN AlbumId TYPE varchar(30),
	ALTER COLUMN Title TYPE varchar(30);

\d+ PHOTOS;

CREATE TABLE PHOTO_ALBUMS(
    ID Text PRIMARY KEY NOT NULL,
    Title Text NOT NULL,
    Description Text NULL,
    Background Text NOT NULL
);

ALTER TABLE PHOTO_ALBUMS
	ALTER COLUMN Title TYPE varchar(30);

\d+ PHOTO_ALBUMS;

CREATE TABLE PAGES(
    ID Text PRIMARY KEY NOT NULL,
    Link Text NOT NULL,
    Title Text NULL,
    Href Text NULL,
    Img Text NULL,
    Keywords Text NULL,
    Description Text NULL
);

INSERT INTO PAGES (id, link, title, href, img) VALUES
	('home', 'Главная', 'Главная', '/', null),
	('about', 'О нас', 'О нас', '/about', '...'),
	('trip', 'Трипы', 'Путешествия', '/articles/trip', 'https://pp.userapi.com/c841024/v841024071/4e9cf/ZC8XVAoqjZg.jpg'),
	('exp', 'Публикации', 'Публикации', '/articles/exp', '/static/images/IMG_0616.jpg'),
	('mind', 'Мысли', 'Мысли', '/articles/mind', 'https://pp.userapi.com/c840427/v840427415/27e0c/AOheyNmAHqY.jpg'),
	('photo', 'Фото', 'Фотогаллерея', '/photo', '/static/images/IMG_0616.jpg'),
	('more', 'Больше', 'Еще', null, null);

\d+ PAGES;
