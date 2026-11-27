/* Compact paper entries (idea from browsing other economists' pages, nothing copied):
   - coauthors and status go on one details line;
   - "Materials" links become small buttons in the same row as Abstract;
   - "Media coverage" becomes a Press button that opens the outlets;
   - a Cite button opens a ready-to-copy BibTeX entry.
   The HTML keeps its usual form (.by, .status, .mat, .media lines); this script rearranges it on load.
   To add a citation for a new paper, add an entry to CITES with a piece of its title link's href. */
(function () {
  var ME = "Riva, Flavio";
  // match: a piece of the href of the paper's title link. Title and URL are read from the page.
  var CITES = [
    { match: "ai_writing_pedagogy", key: "FermanLimaRiva2025", type: "unpublished", authors: ["Ferman, Bruno", "Lima, Lycia", ME], year: 2025, note: "Working paper" },
    { match: "melo_riva_2026_pim", key: "MeloRiva2026", type: "unpublished", authors: ["Melo, Carolina", ME], year: 2026, note: "Working paper" },
    { match: "riva_2026_owl_mothers.pdf", key: "Riva2026OwlMothers", type: "unpublished", authors: [ME], year: 2026, note: "Working paper" },
    { match: "equity_case_for_phonics", key: "Riva2026", type: "unpublished", authors: [ME], year: 2026, note: "Working paper" },
    { match: "payoff_to_early_literacy.pdf", key: "Riva2026Literacy", type: "unpublished", authors: [ME], year: 2026, note: "Working paper" },
    { match: "universal_full_day_high_school", key: "FrancoGoussainRiva2026", type: "unpublished", authors: ["Franco, Samuel", "Goussain, Bruna", ME], year: 2026, note: "Working paper" },
    { match: "delivering_health_at_school.pdf", key: "BragaRivaRocha2026", type: "unpublished", authors: ["Braga, Lia", ME, "Rocha, Rudi"], year: 2026, note: "Working paper" },
    { match: "early_life_primary_care.pdf", key: "NunesMaiaRiva2026", type: "unpublished", authors: ["Nunes, Letícia", "Maia, Pedro H. Chaves", ME], year: 2026, note: "Working paper" },
    { match: "from_apprentice_to_formal_worker", key: "CorbiLealRiva2026", type: "unpublished", authors: ["Corbi, Raphael", "Leal, Matheus", ME], year: 2026, note: "Working paper" },
    { match: "07350015.2024.2388639", key: "PossebomRiva2024", type: "article", authors: ["Possebom, Vitor", ME], year: 2024,
      journal: "Journal of Business \\& Economic Statistics", doi: "10.1080/07350015.2024.2388639" },
    { match: "book/46710", key: "FirpoPortellaRivaUbida2023", type: "incollection", authors: ["Firpo, Sergio", "Portella, Alysson", ME, "Úbida, Giovanna"], year: 2023,
      booktitle: "Tasks, Skills, and Institutions: The Changing Nature of Work and Inequality",
      editor: "Gradín, C. and Lewandowski, P. and Schotte, S. and Sen, K.", publisher: "Oxford University Press", pages: "229--252" },
    { match: "izajole-2021-0002", key: "CamargoLimaRivaSouza2021", type: "article", authors: ["Camargo, Juliana", "Lima, Lycia", ME, "Souza, André Portela"], year: 2021,
      journal: "IZA Journal of Labor Economics", doi: "10.2478/izajole-2021-0002" },
    { match: "nivelar-o-campo-de-jogo", key: "FrancoRiva2025", type: "techreport", authors: ["Franco, Samuel", ME], year: 2025, institution: "Imds", reporttype: "Nota Técnica" },
    { match: "programa-jovem-aprendiz-empregabilidade", key: "CorbiEtAl2025", type: "techreport", authors: ["Corbi, Raphael", "Guimarães, Sergio", "Leal, Matheus", ME, "Tafner, Paulo"], year: 2025, institution: "Imds", reporttype: "Nota Técnica" },
    { match: "centros-de-referencia-em-assistencia-social", key: "Riva2023", type: "techreport", authors: [ME], year: 2023, institution: "Imds", reporttype: "Nota Técnica" }
  ];

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function bi(en, pt) { return '<span class="en">' + en + '</span><span class="pt">' + pt + "</span>"; }

  function bibtex(c, title, url) {
    var f = [["author", c.authors.join(" and ")], ["title", "{" + title + "}"]];
    if (c.journal) f.push(["journal", c.journal]);
    if (c.booktitle) f.push(["booktitle", c.booktitle], ["editor", c.editor], ["publisher", c.publisher]);
    if (c.institution) f.push(["institution", c.institution], ["type", c.reporttype]);
    f.push(["year", String(c.year)]);
    if (c.pages) f.push(["pages", c.pages]);
    if (c.note) f.push(["note", c.note]);
    if (c.doi) f.push(["doi", c.doi]); else if (url) f.push(["url", url]);
    return "@" + c.type + "{" + c.key + ",\n" + f.map(function (p) { return "  " + p[0] + " = {" + p[1] + "}"; }).join(",\n") + "\n}";
  }

  document.querySelectorAll("ol.papers > li").forEach(function (li) {
    var title = li.querySelector(".ptitle"), by = li.querySelector(":scope > .by");
    var statuses = li.querySelectorAll(":scope > .status");
    var mat = li.querySelector(":scope > .mat"), media = li.querySelector(":scope > .media");
    if (!title) return;

    // 1. One details line: coauthors · status · status
    if (by || statuses.length) {
      var meta = el("p", "meta"), parts = [];
      if (by) parts.push(by);
      statuses.forEach(function (s) { parts.push(s); });
      parts.forEach(function (p, i) {
        if (i) meta.appendChild(el("span", "dot", "·"));
        var s = el("span", p.className); while (p.firstChild) s.appendChild(p.firstChild);
        meta.appendChild(s); p.remove();
      });
      title.after(meta);
    }

    // 2. One row of small buttons
    var row = li.querySelector(":scope > .toggles");
    if (!row) { row = el("div", "toggles"); (li.querySelector(":scope > .meta") || title).after(row); }
    if (mat) {
      mat.querySelectorAll("a").forEach(function (a) { a.classList.add("chip"); row.appendChild(a); });
      mat.remove();
    }
    if (media) {
      var press = el("div", "panel press"); press.dataset.p = "m"; press.hidden = true;
      var links = media.querySelectorAll("a");
      links.forEach(function (a, i) { if (i) press.appendChild(el("span", "dot", "·")); press.appendChild(a); });
      li.appendChild(press); media.remove();
      var pb = el("button", "tg", bi("Press", "Na imprensa")); pb.type = "button"; pb.dataset.p = "m"; pb.setAttribute("aria-expanded", "false");
      row.appendChild(pb);
    }

    // 3. Cite
    var link = title.querySelector("a"), href = link ? link.getAttribute("href") : "";
    var c = CITES.filter(function (x) { return href.indexOf(x.match) !== -1; })[0];
    if (c) {
      var t = (link.textContent || "").replace(/\s+/g, " ").trim();
      var url = link.href;
      var text = bibtex(c, t, url);
      var cp = el("div", "panel cite"); cp.dataset.p = "c"; cp.hidden = true;
      var pre = el("pre", "bib"); pre.textContent = text; cp.appendChild(pre);
      var copy = el("button", "copy", bi("Copy", "Copiar")); copy.type = "button";
      copy.addEventListener("click", function () {
        var done = function () { copy.innerHTML = bi("Copied", "Copiado"); setTimeout(function () { copy.innerHTML = bi("Copy", "Copiar"); }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      });
      cp.appendChild(copy);
      li.appendChild(cp);
      var cb = el("button", "tg", bi("Cite", "Citar")); cb.type = "button"; cb.dataset.p = "c"; cb.setAttribute("aria-expanded", "false");
      row.appendChild(cb);
    }
    if (!row.children.length) row.remove();
  });
})();
