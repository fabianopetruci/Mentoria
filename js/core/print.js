window.Print = {
  section(id, title = "Impressão") {
    const el = document.getElementById(id);
    if (!el) return;

    const html = `
      <html>
      <head>
        <title>${title}</title>

        <style>
          body{
            font-family: Arial, sans-serif;
            padding:40px;
          }

          h1{
            margin-bottom:20px;
          }

          table{
            width:100%;
            border-collapse: collapse;
          }

          th,td{
            border:1px solid #ccc;
            padding:8px;
            text-align:left;
          }
        </style>

      </head>

      <body>

        <h1>${title}</h1>

        ${el.outerHTML}

      </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  },
};
