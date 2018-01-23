import Knex from 'knex';
import params from '../params/params.js';

class Postgress {
  constructor(connection) {
    this.pg = Knex({connection, client: 'pg'});
  }

  queryRows(table, from = 0, to) {
    let query = this.pg(table)
      .select('*')
      .offset(from);

    if (to !== undefined && to !== null) {
      query = query.limit(to);
    }

    return query;
  }

  queryCount(table, from = 0, to) {
    let query = this.pg(table)
      .offset(from)
      .count('*');

    if (to !== undefined && to !== null) {
      query = query.limit(to);
    }

    return query;
  }

  async getRowsAndCount(queryRows, queryCount) {
    return await this.pg.raw(`${queryRows};${queryCount}`).then((result) => {
      return {
        items: result[0].rows,
        count: result[0].rowCount,
        total: result[1].rows[0].count
      };
    });
  }

  async getArticleById(id) {
    return (await this.queryRows('articles', 0, 1).where('id', id))[0];
  }

  getCategories() {
    return this.queryRows('articles_categories');
  }

  async getCategoryById(id) {
    return (await this.queryRows('articles_categories', 0, 1).where('id', id))[0];
  }

  async getArticlesByKV(from, to, whereK, whereV, order = 'id') {
    const QUERYCOUNT = this.queryCount('articles', from, to)
      .where(whereK, whereV)
      .toString();

    const QUERYROWS = this.queryRows('articles', from, to)
      .where(whereK, whereV)
      .orderBy(order)
      .toString();

    return await this.getRowsAndCount(QUERYROWS, QUERYCOUNT);
  }

  async getArticles(from, to) {
    const QUERYCOUNT = this.queryCount('articles', from, to).toString();
    const QUERYROWS = this.queryRows('articles', from, to).toString();

    return await this.getRowsAndCount(QUERYROWS, QUERYCOUNT);
  }

  async getMenu() {
    const menu = {};

    (await this.queryRows('pages')).forEach((page) => {
      menu[page.id] = page;
    });

    return menu;
  }

  getSlides() {
    return this.queryRows('slides');
  }

  getAlbums() {
    return this.queryRows('photo_albums');
  }

  async getAlbumById(id) {
    return (await this.queryRows('photos_albums', 0, 1).where('id', id))[0];
  }

  async getPhotos(from, to) {
    const QUERYCOUNT = this.queryCount('photos', from, to).toString();
    const QUERYROWS = this.queryRows('photos', from, to).toString();

    return await this.getRowsAndCount(QUERYROWS, QUERYCOUNT);
  }

  async getPhotosByAlbum(from, to, album) {
    const QUERYCOUNT = this.queryCount('photos', from, to)
      .where('album', album)
      .toString();

    const QUERYROWS = this.queryRows('photos', from, to)
      .where('album', album)
      .toString();

    return await this.getRowsAndCount(QUERYROWS, QUERYCOUNT);
  }
}

export default new Postgress(params.POSTGRES);