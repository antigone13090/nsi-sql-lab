export const escape = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export const pad = index => String(index + 1).padStart(2, '0');

export function resultTable(result, title) {
  const show = 80;
  const headings = result.columns.map(column => `<th scope="col">${escape(column)}</th>`).join('');
  const rows = result.rows.slice(0, show).map(row => '<tr>' + row.map(value => {
    if (value === null) return '<td><code class="null">NULL</code></td>';
    if (value instanceof Uint8Array) return `<td>BLOB (${value.length} octets)</td>`;
    return `<td>${escape(value)}</td>`;
  }).join('') + '</tr>').join('');
  const count = `${result.rows.length} ligne${result.rows.length === 1 ? '' : 's'}`;
  return `<section class="result">
    <div class="result-heading"><h3>${escape(title)}</h3><span>${count}</span></div>
    <div class="table-scroll" tabindex="0" role="region" aria-label="${escape(title)}"><table>
      <thead><tr>${headings}</tr></thead><tbody>${rows || `<tr><td colspan="${result.columns.length}">Aucune ligne</td></tr>`}</tbody>
    </table></div>
    ${result.rows.length > show ? `<p class="small">Les ${show} premières lignes sont affichées. La vérification compare toutes les lignes.</p>` : ''}
  </section>`;
}

export function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
