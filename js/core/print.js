window.Print = {
  section(id, title = "Impressão") {
    const el = document.getElementById(id);
    if (!el) return;

    // clona o conteúdo
    const clone = el.cloneNode(true);

    // remove todas as imagens (fotos dos alunos)
    clone.querySelectorAll("img").forEach((img) => img.remove());

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
            margin-bottom:30px;
          }

          .aluno-card{
            border:1px solid #ccc;
            padding:15px;
            margin-bottom:20px;
            border-radius:6px;
          }

          .aluno-row{
            margin-bottom:4px;
          }

          .aluno-label{
            font-weight:bold;
          }

          .aluno-value{
            margin-right:10px;
          }

          img{
            display:none;
          }
        </style>

      </head>

      <body>

        <h1>${title}</h1>

        ${clone.outerHTML}

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
