// sidepanel.js
document.addEventListener('DOMContentLoaded', () => {
  const rulesTableBody = document.getElementById('rulesTableBody');
  const ruleForm = document.getElementById('ruleForm');
  const closeSidebarButton = document.getElementById('closeSidebar');
  const searchInput = document.getElementById('tableSearch'); // Ensure this exists in your HTML
  const extensionSelect = document.getElementById('extensionSelect');
  const addGroupBtn = document.getElementById('addGroupBtn');
  const addExtensionBtn = document.getElementById('addExtensionBtn');

  // Default extension groups
  const defaultExtensionGroups = {
    "Compressed": ["zip", "7z", "tar", "rar", "gz"],
    "Videos": ["mp4", "mkv", "avi", "mov"],
    // ... add other groups as needed
  };

  // This variable will hold the extension groups loaded from storage.
  let extensionGroups = {};

  // Load extension groups from storage (or use defaults if not present)
  function loadExtensionGroups(callback) {
    chrome.storage.sync.get({ extensionGroups: defaultExtensionGroups }, (data) => {
      extensionGroups = data.extensionGroups;
      callback && callback();
    });
  }

  // Save the current extensionGroups object to storage
  function saveExtensionGroups(callback) {
    chrome.storage.sync.set({ extensionGroups: extensionGroups }, callback);
  }

  // Populate the extension dropdown (for adding rules)
  function populateExtensionDropdown() {
    if (!extensionSelect) return;
    extensionSelect.innerHTML = '<option value="">-- Select extension or group --</option>';
    for (const group in extensionGroups) {
      // Option to address the whole group
      const groupOption = document.createElement('option');
      groupOption.value = "group:" + group;
      groupOption.textContent = group + " (All)";
      extensionSelect.appendChild(groupOption);

      // Create an optgroup for individual extensions
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      extensionGroups[group].forEach(ext => {
        const option = document.createElement('option');
        option.value = ext;
        option.textContent = ext;
        optgroup.appendChild(option);
      });
      extensionSelect.appendChild(optgroup);
    }
  }

  // Populate the group dropdown in the "Add Extension" modal
  function populateExtensionGroupSelect() {
    const extensionGroupSelect = document.getElementById('extensionGroupSelect');
    if (!extensionGroupSelect) return;
    extensionGroupSelect.innerHTML = '<option value="">-- Select a group --</option>';
    Object.keys(extensionGroups).forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      extensionGroupSelect.appendChild(option);
    });
  }

  // Call this once at startup to load extension groups and populate dropdowns
  loadExtensionGroups(() => {
    populateExtensionDropdown();
    populateExtensionGroupSelect();
  });

  // Modal elements for "Add Group"
  const addGroupModal = document.getElementById('addGroupModal');
  const newGroupNameInput = document.getElementById('newGroupName');
  const saveGroupBtn = document.getElementById('saveGroupBtn');
  const cancelGroupBtn = document.getElementById('cancelGroupBtn');

  // Modal elements for "Add Extension"
  const addExtensionModal = document.getElementById('addExtensionModal');
  const newExtensionValueInput = document.getElementById('newExtensionValue');
  const saveExtensionBtn = document.getElementById('saveExtensionBtn');
  const cancelExtensionBtn = document.getElementById('cancelExtensionBtn');

  // Utility functions to show/hide modals
  function showModal(modalEl) {
    modalEl.classList.remove('hidden');
  }
  function hideModal(modalEl) {
    modalEl.classList.add('hidden');
  }

  // Instead of prompt() for adding a group, show the modal
  addGroupBtn.addEventListener('click', () => {
    newGroupNameInput.value = '';
    showModal(addGroupModal);
  });
  cancelGroupBtn.addEventListener('click', () => hideModal(addGroupModal));
  saveGroupBtn.addEventListener('click', () => {
    const groupName = newGroupNameInput.value.trim();
    if (!groupName) {
      alert("Group name cannot be empty.");
      return;
    }
    if (!extensionGroups[groupName]) {
      extensionGroups[groupName] = [];
      saveExtensionGroups(() => {
        populateExtensionDropdown();
        populateExtensionGroupSelect();
        hideModal(addGroupModal);
      });
    } else {
      alert("Group already exists.");
    }
  });

  // Instead of prompt() for adding an extension, show the modal
  addExtensionBtn.addEventListener('click', () => {
    newExtensionValueInput.value = '';
    populateExtensionGroupSelect();
    showModal(addExtensionModal);
  });
  cancelExtensionBtn.addEventListener('click', () => hideModal(addExtensionModal));
  saveExtensionBtn.addEventListener('click', () => {
    const extensionGroupSelect = document.getElementById('extensionGroupSelect');
    const groupName = extensionGroupSelect.value;
    const newExtension = newExtensionValueInput.value.trim();
    if (!groupName) {
      alert("Please select a group.");
      return;
    }
    if (!newExtension) {
      alert("Extension cannot be empty.");
      return;
    }
    if (!extensionGroups[groupName].includes(newExtension)) {
      extensionGroups[groupName].push(newExtension);
      saveExtensionGroups(() => {
        populateExtensionDropdown();
        populateExtensionGroupSelect();
        hideModal(addExtensionModal);
      });
    } else {
      alert("Extension already exists in this group.");
    }
  });

  // Pre-fill the Source URL field with the active tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      document.getElementById('sourceUrlContains').value = tabs[0].url;
    }
  });

  // Function to filter table rows based on the search input
  function filterTable() {
    const filterValue = searchInput ? searchInput.value.toLowerCase() : '';
    const rows = rulesTableBody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
      const cells = row.getElementsByTagName('td');
      let rowContains = false;
      Array.from(cells).forEach(cell => {
        if (cell.textContent.toLowerCase().includes(filterValue)) {
          rowContains = true;
        }
      });
      row.style.display = rowContains ? '' : 'none';
    });
  }

  // Function to load and render rules as table rows
  function loadRules() {
    chrome.storage.sync.get({ rules: [] }, (data) => {
      let rules = data.rules || [];
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rulesTableBody.innerHTML = '';
      rules.forEach((rule, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-index', index);
        tr.className = 'odd:bg-white even:bg-gray-100 border-b border-gray-200 hover:bg-gray-50';

        // File Extension Cell with embedded drag handle
        const tdFileExt = document.createElement('td');
        tdFileExt.className = 'px-4 py-2';
        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle mr-2 cursor-move';
        dragHandle.innerHTML = `<i class="bx bx-menu"></i>`;
        tdFileExt.appendChild(dragHandle);
        const spanContent = document.createElement('span');
        if (rule.conditions && rule.conditions.extensionGroup) {
          spanContent.innerHTML = `<i class="bx bx-layer mr-2"></i> ${rule.conditions.extensionGroup} (Group)`;
        } else {
          spanContent.textContent = rule.conditions ? (rule.conditions.fileExtension || '') : '';
        }
        tdFileExt.appendChild(spanContent);
        tr.appendChild(tdFileExt);

        // Source URL Contains Cell
        const tdSourceUrl = document.createElement('td');
        tdSourceUrl.className = 'px-4 py-2';
        tdSourceUrl.textContent = rule.conditions ? (rule.conditions.sourceUrlContains || '') : '';
        tdSourceUrl.style.display = '-webkit-box';
        tdSourceUrl.style.webkitBoxOrient = 'vertical';
        tdSourceUrl.style.overflow = 'hidden';
        tdSourceUrl.style.textOverflow = 'ellipsis';
        tdSourceUrl.style.width = '100px';
        tr.appendChild(tdSourceUrl);

        // Folder Cell with folder icon
        const tdFolder = document.createElement('td');
        tdFolder.className = 'px-4 py-2';
        tdFolder.innerHTML = `<i class="bx bx-folder mr-2"></i>${rule.folder || ''}`;
        tr.appendChild(tdFolder);

        // Actions Cell with Edit and Delete buttons
        const tdActions = document.createElement('td');
        tdActions.className = 'px-4 py-2 text-center space-x-2';
        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-600 hover:text-blue-800 transition text-lg';
        editBtn.innerHTML = `<i class="bx bx-edit-alt"></i>`;
        editBtn.title = 'Edit';
        editBtn.addEventListener('click', () => {
          enterEditMode(tr, rule, index, rules);
        });
        tdActions.appendChild(editBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-600 hover:text-red-800 transition text-lg';
        deleteBtn.innerHTML = `<i class="bx bx-trash"></i>`;
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => {
          rules.splice(index, 1);
          rules.forEach((r, i) => (r.precedence = rules.length - i));
          chrome.storage.sync.set({ rules }, () => {
            loadRules();
            filterTable();
          });
        });
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);

        rulesTableBody.appendChild(tr);
      });
      filterTable();
      initSortable();
    });
  }

  // Initialize SortableJS on the table body using the drag handle
  function initSortable() {
    if (window.Sortable) {
      if (window.sortableInstance) {
        window.sortableInstance.destroy();
      }
      window.sortableInstance = Sortable.create(rulesTableBody, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function () {
          chrome.storage.sync.get({ rules: [] }, (data) => {
            let rules = data.rules || [];
            const newRules = [];
            rulesTableBody.querySelectorAll('tr').forEach((row) => {
              const originalIndex = parseInt(row.getAttribute('data-index'));
              if (!isNaN(originalIndex)) {
                newRules.push(rules[originalIndex]);
              }
            });
            newRules.forEach((r, i) => (r.precedence = newRules.length - i));
            chrome.storage.sync.set({ rules: newRules }, loadRules);
          });
        }
      });
    } else {
      console.warn('SortableJS not loaded.');
    }
  }

  // Function to enter edit mode for a rule row (using a dropdown for extension/group)
  function enterEditMode(tr, rule, index, rules) {
    tr.innerHTML = '';
    // Editable cell for File Extension / Group using a dropdown
    const tdFileExt = document.createElement('td');
    tdFileExt.className = 'px-4 py-2';
    const selectExt = document.createElement('select');
    selectExt.className = 'w-full border border-gray-300 rounded px-2 py-1';
    selectExt.innerHTML = '<option value="">-- Select extension or group --</option>';
    for (const group in extensionGroups) {
      const groupOption = document.createElement('option');
      groupOption.value = "group:" + group;
      groupOption.textContent = group + " (All)";
      selectExt.appendChild(groupOption);
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      extensionGroups[group].forEach(ext => {
        const option = document.createElement('option');
        option.value = ext;
        option.textContent = ext;
        optgroup.appendChild(option);
      });
      selectExt.appendChild(optgroup);
    }
    if (rule.conditions) {
      if (rule.conditions.extensionGroup) {
        selectExt.value = "group:" + rule.conditions.extensionGroup;
      } else if (rule.conditions.fileExtension) {
        selectExt.value = rule.conditions.fileExtension;
      }
    }
    tdFileExt.appendChild(selectExt);
    tr.appendChild(tdFileExt);

    // Editable cell for Source URL Contains
    const tdSourceUrl = document.createElement('td');
    tdSourceUrl.className = 'px-4 py-2';
    const inputSourceUrl = document.createElement('input');
    inputSourceUrl.type = 'text';
    inputSourceUrl.value = rule.conditions ? (rule.conditions.sourceUrlContains || '') : '';
    inputSourceUrl.className = 'w-full border border-gray-300 rounded px-2 py-1';
    tdSourceUrl.appendChild(inputSourceUrl);
    tr.appendChild(tdSourceUrl);

    // Editable cell for Folder
    const tdFolder = document.createElement('td');
    tdFolder.className = 'px-4 py-2';
    const inputFolder = document.createElement('input');
    inputFolder.type = 'text';
    inputFolder.value = rule.folder || '';
    inputFolder.className = 'w-full border border-gray-300 rounded px-2 py-1';
    tdFolder.appendChild(inputFolder);
    tr.appendChild(tdFolder);

    // Actions: Save and Cancel buttons
    const tdActions = document.createElement('td');
    tdActions.className = 'px-4 py-2 text-center space-x-2';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'text-green-600 hover:text-green-800 transition text-lg';
    saveBtn.innerHTML = `<i class="bx bx-check"></i>`;
    saveBtn.addEventListener('click', () => {
      const extVal = selectExt.value.trim();
      const sourceUrlVal = inputSourceUrl.value.trim();
      const folderVal = inputFolder.value.trim();
      let updatedRule = { folder: folderVal, precedence: rule.precedence || 0 };
      let conditions = {};
      if (extVal) {
        if (extVal.startsWith("group:")) {
          conditions.extensionGroup = extVal.substring(6);
        } else {
          conditions.fileExtension = extVal;
        }
      }
      if (sourceUrlVal) conditions.sourceUrlContains = sourceUrlVal;
      if (Object.keys(conditions).length > 0) updatedRule.conditions = conditions;
      rules[index] = updatedRule;
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rules.forEach((r, i) => (r.precedence = rules.length - i));
      chrome.storage.sync.set({ rules }, () => {
        loadRules();
        filterTable();
      });
    });
    tdActions.appendChild(saveBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'text-red-600 hover:text-red-800 transition text-lg';
    cancelBtn.innerHTML = `<i class="bx bx-x"></i>`;
    cancelBtn.addEventListener('click', () => {
      loadRules();
      filterTable();
    });
    tdActions.appendChild(cancelBtn);
    tr.appendChild(tdActions);
  }

  // Form submission: Add a new rule
  ruleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const extensionValue = extensionSelect.value.trim();
    const sourceUrlContains = document.getElementById('sourceUrlContains').value.trim();
    const folder = document.getElementById('folder').value.trim();
    chrome.storage.sync.get({ rules: [] }, (data) => {
      let rules = data.rules || [];
      const precedence = rules.length + 1;
      let newRule = { folder, precedence };
      let conditions = {};
      if (extensionValue) {
        if (extensionValue.startsWith("group:")) {
          conditions.extensionGroup = extensionValue.substring(6);
        } else {
          conditions.fileExtension = extensionValue;
        }
      }
      if (sourceUrlContains) conditions.sourceUrlContains = sourceUrlContains;
      if (Object.keys(conditions).length > 0) newRule.conditions = conditions;
      rules.push(newRule);
      rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));
      rules.forEach((r, i) => (r.precedence = rules.length - i));
      chrome.storage.sync.set({ rules }, () => {
        ruleForm.reset();
        populateExtensionDropdown();
        loadRules();
        filterTable();
      });
    });
  });

  // Listen for storage changes and reload the table in real time
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.rules) {
      loadRules();
      filterTable();
    }
  });

  // Search input event listener for filtering table rows
  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }

  // Close sidebar handler
  closeSidebarButton.addEventListener('click', () => {
    window.close();
  });

  loadRules();
});
