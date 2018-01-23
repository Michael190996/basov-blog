import {markdown} from "markdown";

export default function (koaPug) {
  return {
    formatDate(date) {
      console.log(date);
    },

    generate(text, type, locals) {
      if (type === 'pug') {
        return koaPug.render(text, locals, { fromString: true });
      }

      if (type === 'markdown') {
        return markdown.toHTML(text);
      }
    }
  };
}