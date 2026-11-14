function syncOperationFilter(select) {
  const picker = select.parentElement;
  const summary = picker.querySelector('.ops-picker-value');
  const choices = picker.querySelector('.ops-picker-choices');
  const selected = Array.from(select.selectedOptions, option => option.value);
  const options = Array.from(select.options).filter(option => option.value !== 'all');
  const signature = JSON.stringify(options.map(option => [option.value, option.textContent, option.parentElement.label]));
  if (choices.dataset.options !== signature) {
    choices.replaceChildren();
    let lastGroup;
    for (const option of options) {
      const group = option.parentElement.label;
      if (group && group !== lastGroup) {
        const heading = document.createElement('p');
        heading.className = 'ops-picker-group';
        heading.textContent = group.replace(/─/g, '').trim();
        choices.append(heading);
      }
      lastGroup = group;
      const row = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = option.value;
      input.addEventListener('change', () => {
        const values = new Set(getOperationFilterValues(select.id));
        if (input.checked) values.add(input.value);
        else values.delete(input.value);
        setOperationFilterValues(select.id, [...values]);
        filterOperationsList();
      });
      row.append(input, document.createTextNode(option.textContent.trim()));
      choices.append(row);
    }
    choices.dataset.options = signature;
  }
  choices.querySelectorAll('input').forEach(input => { input.checked = selected.includes(input.value); });
  const active = options.filter(option => selected.includes(option.value));
  summary.textContent = active.length > 1 ? active.length.toLocaleString('ar-EG') + ' محدد' :
    active.length === 1 ? active[0].textContent.trim() : picker.dataset.allLabel;
  summary.title = active.map(option => option.textContent.trim()).join('، ');
  picker.classList.toggle('has-selection', active.length > 0);
  picker.querySelector('.ops-picker-reset').disabled = active.length === 0;
}

function getOperationFilterValues(id) {
  return Array.from(document.getElementById(id).selectedOptions, option => option.value).filter(value => value !== 'all');
}

function setOperationFilterValues(id, values) {
  const select = document.getElementById(id);
  const valid = values.filter(value => value !== 'all' && Array.from(select.options).some(option => option.value === value));
  Array.from(select.options).forEach(option => {
    option.selected = valid.length ? valid.includes(option.value) : option.value === 'all';
  });
  syncOperationFilter(select);
}

function resetOperationPicker(button) {
  setOperationFilterValues(button.closest('details').querySelector('select').id, []);
  filterOperationsList();
}

function closeOperationPicker(button) {
  const picker = button.closest('details');
  picker.open = false;
  picker.querySelector('summary').focus();
}

function refreshOperationProjectFilter(projects, values = getOperationFilterValues('opsFilterProject')) {
  const select = document.getElementById('opsFilterProject');
  const names = [...new Set([...projects, ...values.filter(value => value !== '__no_project__')])];
  const wanted = ['all', '__no_project__', ...names];
  if (wanted.some((value, i) => select.options[i]?.value !== value) || select.options.length !== wanted.length) {
    select.replaceChildren(new Option('كل المشاريع', 'all'), new Option('بدون مشروع', '__no_project__'),
      ...names.map(name => new Option(name, name)));
  }
  setOperationFilterValues(select.id, values);
}

function initializeOperationPickers() {
  const group = document.querySelector('.ops-filter-grid');
  const pickers = Array.from(group.querySelectorAll('details'));
  pickers.forEach(picker => syncOperationFilter(picker.querySelector('select')));
  document.addEventListener('click', event => {
    pickers.forEach(picker => {
      if (picker.open && !picker.contains(event.target)) picker.open = false;
    });
  });
  group.addEventListener('keydown', event => {
    const picker = event.target.closest('details[open]');
    if (event.key === 'Escape' && picker) {
      event.preventDefault();
      event.stopPropagation();
      closeOperationPicker(picker.querySelector('summary'));
    }
  });
}
document.addEventListener('DOMContentLoaded', initializeOperationPickers, { once: true });