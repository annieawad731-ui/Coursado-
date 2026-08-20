document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // DOM ELEMENTS
    // =========================================================

    const paymentModal = document.getElementById('paymentModal');

    const openModalBtn = document.getElementById('openModalBtn');
    const quickAddPayment = document.getElementById('quickAddPayment');
    const closeModal = document.getElementById('closeModal');

    const paymentForm = document.getElementById('paymentForm');

    const studentNameInput = document.getElementById('studentName');
    const categorySelect = document.getElementById('categorySelect');
    const otherCategoryWrapper = document.getElementById('otherCategoryWrapper');
    const otherCategoryText = document.getElementById('otherCategoryText');

    const amountPaidInput = document.getElementById('amountPaid');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentDateInput = document.getElementById('paymentDate');

    const paymentsTableBody = document.getElementById('paymentsTableBody');
    const allPaymentsTableBody = document.getElementById('allPaymentsTableBody');
    const studentsTableBody = document.getElementById('studentsTableBody');

    const totalStudentsSpan = document.getElementById('totalStudents');
    const totalPaymentsCountSpan = document.getElementById('totalPaymentsCount');
    const totalCollectedSpan = document.getElementById('totalCollected');
    const thisMonthCollectedSpan = document.getElementById('thisMonthCollected');

    const activityList = document.getElementById('activityList');

    const pageTitle = document.getElementById('pageTitle');

    const navItems = document.querySelectorAll(
        '.nav-menu .nav-item'
    );

    const viewSections = document.querySelectorAll(
        '.view-section'
    );

    // STUDENT SEARCH
    const studentSearchInput =
        document.getElementById('studentSearchInput');

    const studentCategoryFilter =
        document.getElementById('studentCategoryFilter');

    // PAYMENT SEARCH
    const paymentSearchInput =
        document.getElementById('paymentSearchInput');

    // REPORTS
    const reportTotalRevenue =
        document.getElementById('reportTotalRevenue');

    const reportTotalCount =
        document.getElementById('reportTotalCount');

    const reportUniqueStudents =
        document.getElementById('reportUniqueStudents');

    const categoryBreakdownContainer =
        document.getElementById('categoryBreakdownContainer');

    // EXPORTS
    const exportMonthSelect =
        document.getElementById('exportMonthSelect');

    const exportCategorySelect =
        document.getElementById('exportCategorySelect');

    const downloadMonthExcelBtn =
        document.getElementById('downloadMonthExcelBtn');

    const downloadCategoryExcelBtn =
        document.getElementById('downloadCategoryExcelBtn');


    // =========================================================
    // VARIABLES
    // =========================================================

    let monthlyChartInstance = null;


    // =========================================================
    // DEFAULT DATE
    // =========================================================

    paymentDateInput.value =
        new Date().toISOString().split('T')[0];


    // =========================================================
    // LOAD PAYMENTS FROM LOCAL STORAGE
    // =========================================================

    let payments =
        JSON.parse(
            localStorage.getItem(
                'coursado_dashboard_payments'
            )
        ) || [];


    // =========================================================
    // SWITCH BETWEEN VIEWS
    // =========================================================

    function switchView(targetViewId) {

        viewSections.forEach(section => {
            section.style.display = 'none';
        });

        navItems.forEach(item => {
            item.classList.remove('active');
        });


        const targetSection =
            document.getElementById(
                `${targetViewId}View`
            );

        const targetNav =
            document.querySelector(
                `.nav-menu .nav-item[data-view="${targetViewId}"]`
            );


        if (targetSection) {
            targetSection.style.display = 'block';
        }

        if (targetNav) {
            targetNav.classList.add('active');
        }


        const titles = {

            dashboard:
                'Dashboard Overview',

            students:
                'Students Directory',

            payments:
                'Payment Records',

            reports:
                'Financial Reports & Exports'

        };


        pageTitle.textContent =
            titles[targetViewId] ||
            'Dashboard Overview';


        renderAllViews();
    }


    // =========================================================
    // SIDEBAR NAVIGATION
    // =========================================================

    navItems.forEach(item => {

        item.addEventListener('click', e => {

            e.preventDefault();

            const view =
                item.getAttribute('data-view');

            if (view) {
                switchView(view);
            }

        });

    });


    // =========================================================
    // OTHER DATA-TARGET BUTTONS
    // =========================================================

    document
        .querySelectorAll('[data-target]')
        .forEach(el => {

            el.addEventListener('click', e => {

                e.preventDefault();

                const target =
                    el.getAttribute('data-target');

                switchView(target);

            });

        });


    // =========================================================
    // MODAL
    // =========================================================

    const toggleModal = show => {

        paymentModal.style.display =
            show ? 'flex' : 'none';

    };


    openModalBtn.addEventListener(
        'click',
        () => toggleModal(true)
    );


    quickAddPayment.addEventListener(
        'click',
        () => toggleModal(true)
    );


    closeModal.addEventListener(
        'click',
        () => toggleModal(false)
    );


    window.addEventListener('click', e => {

        if (e.target === paymentModal) {
            toggleModal(false);
        }

    });


    // =========================================================
    // CATEGORY "OTHER"
    // =========================================================

    categorySelect.addEventListener(
        'change',
        e => {

            if (e.target.value === 'Other') {

                otherCategoryWrapper.style.display =
                    'flex';

                otherCategoryText.setAttribute(
                    'required',
                    'true'
                );

            } else {

                otherCategoryWrapper.style.display =
                    'none';

                otherCategoryText.removeAttribute(
                    'required'
                );

                otherCategoryText.value = '';

            }

        }
    );


    // =========================================================
    // ADD PAYMENT
    // =========================================================

    paymentForm.addEventListener(
        'submit',
        e => {

            e.preventDefault();


            let categoryValue =
                categorySelect.value;


            if (categoryValue === 'Other') {

                categoryValue =
                    otherCategoryText.value.trim() ||
                    'Other';

            }


            const newPayment = {

                id: Date.now(),

                name:
                    studentNameInput.value.trim(),

                category:
                    categoryValue,

                amount:
                    parseFloat(
                        amountPaidInput.value
                    ),

                method:
                    paymentMethodSelect.value,

                date:
                    paymentDateInput.value

            };


            payments.unshift(newPayment);

            saveAndRender();


            paymentForm.reset();


            paymentDateInput.value =
                new Date()
                    .toISOString()
                    .split('T')[0];


            otherCategoryWrapper.style.display =
                'none';


            toggleModal(false);

        }
    );


    // =========================================================
    // DELETE PAYMENT
    // =========================================================

    window.deletePayment = function(id) {

        payments =
            payments.filter(
                p => p.id !== id
            );

        saveAndRender();

    };


    // =========================================================
    // SAVE + REFRESH
    // =========================================================

    function saveAndRender() {

        localStorage.setItem(
            'coursado_dashboard_payments',
            JSON.stringify(payments)
        );

        renderAllViews();

    }


    // =========================================================
    // RENDER EVERYTHING
    // =========================================================

    function renderAllViews() {

        renderDashboard();


        const categoryFilterVal =
            studentCategoryFilter
                ? studentCategoryFilter.value
                : 'all';


        const studentSearchVal =
            studentSearchInput
                ? studentSearchInput.value
                : '';


        renderStudentsTable(
            payments,
            categoryFilterVal,
            studentSearchVal
        );


        renderPaymentsTable(payments);

        renderReports();

        populateExportDropdowns();

    }


    // =========================================================
    // DASHBOARD
    // =========================================================

    function renderDashboard() {

        paymentsTableBody.innerHTML = '';


        if (payments.length === 0) {

            paymentsTableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="
                            text-align:center;
                            color:#64748b;
                            font-style:italic;
                        ">
                        No payment records found.
                    </td>
                </tr>
            `;


            totalStudentsSpan.textContent = '0';

            totalPaymentsCountSpan.textContent = '0';

            totalCollectedSpan.textContent =
                'EGP 0';

            thisMonthCollectedSpan.textContent =
                'EGP 0';


            activityList.innerHTML = `
                <p class="empty-activity">
                    No recent activity recorded yet.
                </p>
            `;

            return;
        }


        let totalSum = 0;

        let currentMonthSum = 0;

        const uniqueStudents = new Set();

        const currentMonthStr =
            new Date()
                .toISOString()
                .slice(0, 7);


        payments.forEach(p => {

            totalSum += p.amount;

            uniqueStudents.add(
                p.name.toLowerCase().trim()
            );


            if (
                p.date &&
                p.date.startsWith(currentMonthStr)
            ) {

                currentMonthSum += p.amount;

            }

        });


        totalStudentsSpan.textContent =
            uniqueStudents.size;


        totalPaymentsCountSpan.textContent =
            payments.length;


        totalCollectedSpan.textContent =
            `EGP ${totalSum.toLocaleString()}`;


        thisMonthCollectedSpan.textContent =
            `EGP ${currentMonthSum.toLocaleString()}`;


        // RECENT PAYMENTS

        const recentSlice =
            payments.slice(0, 5);


        recentSlice.forEach(p => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(p.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(p.date)}
                </td>

                <td style="
                    color:#059669;
                    font-weight:600;
                ">
                    EGP ${p.amount.toLocaleString()}
                </td>

                <td>
                    ${escapeHtml(p.category)}
                </td>

                <td>
                    <span class="method-badge">
                        ${escapeHtml(p.method)}
                    </span>
                </td>

                <td>
                    <button
                        class="btn"
                        style="
                            background:#fee2e2;
                            color:#ef4444;
                            padding:0.25rem 0.5rem;
                        "
                        onclick="deletePayment(${p.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>
                </td>

            `;


            paymentsTableBody.appendChild(row);

        });


        // ACTIVITY

        const latest = payments[0];


        activityList.innerHTML = `

            <div style="
                display:flex;
                align-items:start;
                gap:0.5rem;
            ">

                <i
                    class="fa-solid fa-circle-check"
                    style="
                        color:#10b981;
                        margin-top:3px;
                    ">
                </i>

                <div>

                    <p>
                        Payment of
                        <strong>
                            EGP ${latest.amount.toLocaleString()}
                        </strong>
                        recorded for
                        <strong>
                            ${escapeHtml(latest.name)}
                        </strong>.
                    </p>

                    <span style="
                        font-size:0.75rem;
                        color:#94a3b8;
                    ">
                        ${latest.date}
                    </span>

                </div>

            </div>

        `;

    }


    // =========================================================
    // STUDENTS TABLE
    // SEARCH BY NAME + CATEGORY
    // =========================================================

    function renderStudentsTable(
        data,
        selectedCategory = 'all',
        searchQuery = ''
    ) {

        studentsTableBody.innerHTML = '';


        const categoryVal =
            selectedCategory
                .toLowerCase()
                .trim();


        const searchVal =
            searchQuery
                .toLowerCase()
                .trim();


        let filteredPayments = data;


        // CATEGORY FILTER

        if (categoryVal !== 'all') {

            filteredPayments =
                filteredPayments.filter(
                    p =>
                        p.category
                            .toLowerCase()
                            .trim() === categoryVal
                );

        }


        // NAME SEARCH

        if (searchVal !== '') {

            filteredPayments =
                filteredPayments.filter(
                    p =>
                        p.name
                            .toLowerCase()
                            .includes(searchVal)
                );

        }


        // GROUP STUDENTS

        const studentMap = {};


        filteredPayments.forEach(p => {

            const key =
                p.name
                    .toLowerCase()
                    .trim();


            if (!studentMap[key]) {

                studentMap[key] = {

                    name: p.name,

                    count: 0,

                    total: 0,

                    lastCategory: p.category

                };

            }


            studentMap[key].count += 1;

            studentMap[key].total += p.amount;

            studentMap[key].lastCategory =
                p.category;

        });


        const studentList =
            Object.values(studentMap);


        // NO RESULTS

        if (studentList.length === 0) {

            studentsTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        style="
                            text-align:center;
                            color:#64748b;
                            font-style:italic;
                        ">

                        No matching students found.

                    </td>

                </tr>

            `;

            return;

        }


        // DISPLAY STUDENTS

        studentList.forEach(s => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(s.name)}
                    </strong>
                </td>

                <td>
                    ${s.count} payment(s)
                </td>

                <td style="
                    color:#059669;
                    font-weight:600;
                ">
                    EGP ${s.total.toLocaleString()}
                </td>

                <td>

                    <span class="method-badge">
                        ${escapeHtml(s.lastCategory)}
                    </span>

                </td>

            `;


            studentsTableBody.appendChild(row);

        });

    }


    // =========================================================
    // STUDENT SEARCH
    // =========================================================

    function filterStudents() {

        renderStudentsTable(

            payments,

            studentCategoryFilter.value,

            studentSearchInput.value

        );

    }


    studentSearchInput.addEventListener(
        'input',
        filterStudents
    );


    studentCategoryFilter.addEventListener(
        'change',
        filterStudents
    );


    // =========================================================
    // PAYMENTS TABLE
    // =========================================================

    function renderPaymentsTable(data) {

        allPaymentsTableBody.innerHTML = '';


        if (data.length === 0) {

            allPaymentsTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            color:#64748b;
                            font-style:italic;
                        ">

                        No payment records found.

                    </td>

                </tr>

            `;

            return;

        }


        data.forEach(p => {

            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(p.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(p.date)}
                </td>

                <td style="
                    color:#059669;
                    font-weight:600;
                ">
                    EGP ${p.amount.toLocaleString()}
                </td>

                <td>
                    ${escapeHtml(p.category)}
                </td>

                <td>
                    <span class="method-badge">
                        ${escapeHtml(p.method)}
                    </span>
                </td>

                <td>

                    <button
                        class="btn"
                        style="
                            background:#fee2e2;
                            color:#ef4444;
                            padding:0.25rem 0.5rem;
                        "
                        onclick="deletePayment(${p.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            `;


            allPaymentsTableBody.appendChild(row);

        });

    }


    // =========================================================
    // PAYMENT SEARCH
    // =========================================================

    paymentSearchInput.addEventListener(
        'input',
        e => {

            const query =
                e.target.value
                    .toLowerCase()
                    .trim();


            const filtered =
                payments.filter(
                    p =>
                        p.name
                            .toLowerCase()
                            .includes(query) ||

                        p.category
                            .toLowerCase()
                            .includes(query)
                );


            renderPaymentsTable(filtered);

        }
    );


    // =========================================================
    // REPORTS
    // =========================================================

    function renderReports() {

        let totalRev = 0;

        const uniqueStudents = new Set();

        const categoryMap = {};

        const monthlyMap = {};


        payments.forEach(p => {

            totalRev += p.amount;


            uniqueStudents.add(
                p.name
                    .toLowerCase()
                    .trim()
            );


            categoryMap[p.category] =
                (categoryMap[p.category] || 0)
                + p.amount;


            if (p.date) {

                const monthKey =
                    p.date.slice(0, 7);


                monthlyMap[monthKey] =
                    (monthlyMap[monthKey] || 0)
                    + p.amount;

            }

        });


        reportTotalRevenue.textContent =
            `EGP ${totalRev.toLocaleString()}`;


        reportTotalCount.textContent =
            payments.length;


        reportUniqueStudents.textContent =
            uniqueStudents.size;


        categoryBreakdownContainer.innerHTML = '';


        const categories =
            Object.entries(categoryMap);


        if (categories.length === 0) {

            categoryBreakdownContainer.innerHTML = `

                <p class="empty-activity">
                    No data available for breakdown.
                </p>

            `;

        } else {

            categories.forEach(
                ([cat, sum]) => {

                    const item =
                        document.createElement('div');


                    item.className =
                        'breakdown-item';


                    item.innerHTML = `

                        <span>
                            ${escapeHtml(cat)}
                        </span>

                        <strong style="
                            color:#059669;
                        ">
                            EGP ${sum.toLocaleString()}
                        </strong>

                    `;


                    categoryBreakdownContainer
                        .appendChild(item);

                }
            );

        }


        renderMonthlyChart(monthlyMap);

    }


    // =========================================================
    // MONTHLY CHART
    // =========================================================

    function renderMonthlyChart(monthlyMap) {

        const canvas =
            document.getElementById(
                'monthlyChart'
            );


        if (!canvas) return;


        const ctx =
            canvas.getContext('2d');


        const sortedMonths =
            Object.keys(monthlyMap)
                .sort();


        const labels =
            sortedMonths.map(m => {

                const [year, month] =
                    m.split('-');


                const dateObj =
                    new Date(
                        year,
                        month - 1,
                        1
                    );


                return dateObj.toLocaleString(
                    'en-US',
                    {
                        month: 'short',
                        year: 'numeric'
                    }
                );

            });


        const dataValues =
            sortedMonths.map(
                m => monthlyMap[m]
            );


        if (monthlyChartInstance) {

            monthlyChartInstance.destroy();

        }


        monthlyChartInstance =
            new Chart(
                ctx,
                {

                    type: 'bar',

                    data: {

                        labels:
                            labels.length > 0
                                ? labels
                                : ['No Data'],

                        datasets: [

                            {

                                label:
                                    'Revenue (EGP)',

                                data:
                                    dataValues.length > 0
                                        ? dataValues
                                        : [0],

                                backgroundColor:
                                    '#0ea5e9',

                                borderRadius: 6

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            }

                        },

                        scales: {

                            y: {

                                beginAtZero: true,

                                grid: {
                                    color: '#f1f5f9'
                                }

                            },

                            x: {

                                grid: {
                                    display: false
                                }

                            }

                        }

                    }

                }
            );

    }


    // =========================================================
    // EXPORT DROPDOWNS
    // =========================================================

    function populateExportDropdowns() {

        const monthsSet =
            new Set();


        payments.forEach(p => {

            if (p.date) {

                monthsSet.add(
                    p.date.slice(0, 7)
                );

            }

        });


        const sortedMonths =
            Array.from(monthsSet)
                .sort()
                .reverse();


        const currentSelectedMonth =
            exportMonthSelect.value;


        exportMonthSelect.innerHTML = `

            <option value="all">
                All Months (Lifetime)
            </option>

        `;


        sortedMonths.forEach(m => {

            const [year, month] =
                m.split('-');


            const dateObj =
                new Date(
                    year,
                    month - 1,
                    1
                );


            const monthName =
                dateObj.toLocaleString(
                    'en-US',
                    {
                        month: 'long',
                        year: 'numeric'
                    }
                );


            const opt =
                document.createElement(
                    'option'
                );


            opt.value = m;

            opt.textContent =
                monthName;


            exportMonthSelect
                .appendChild(opt);

        });


        if (currentSelectedMonth) {

            exportMonthSelect.value =
                currentSelectedMonth;

        }

    }


    // =========================================================
    // DOWNLOAD CSV
    // =========================================================

    function downloadCSV(
        dataArray,
        filename
    ) {

        if (dataArray.length === 0) {

            alert(
                'No data available to export for this selection.'
            );

            return;

        }


        let csvContent =
            'data:text/csv;charset=utf-8,' +
            'Student Name,Category,Amount (EGP),Payment Method,Date\n';


        dataArray.forEach(p => {

            const row = [

                `"${p.name.replace(/"/g, '""')}"`,

                `"${p.category.replace(/"/g, '""')}"`,

                p.amount,

                `"${p.method}"`,

                `"${p.date}"`

            ];


            csvContent +=
                row.join(',') + '\n';

        });


        const encodedUri =
            encodeURI(csvContent);


        const link =
            document.createElement('a');


        link.setAttribute(
            'href',
            encodedUri
        );


        link.setAttribute(
            'download',
            filename
        );


        document.body.appendChild(link);


        link.click();


        document.body.removeChild(link);

    }


    // =========================================================
    // EXPORT BY MONTH
    // =========================================================

    downloadMonthExcelBtn.addEventListener(
        'click',
        () => {

            const selectedMonth =
                exportMonthSelect.value;


            let filtered = payments;

            let fileSuffix =
                'All_Months';


            if (selectedMonth !== 'all') {

                filtered =
                    payments.filter(
                        p =>
                            p.date &&
                            p.date.startsWith(
                                selectedMonth
                            )
                    );


                fileSuffix =
                    selectedMonth;

            }


            downloadCSV(
                filtered,
                `Coursado_Payments_${fileSuffix}.csv`
            );

        }
    );


    // =========================================================
    // EXPORT BY CATEGORY
    // =========================================================

    downloadCategoryExcelBtn.addEventListener(
        'click',
        () => {

            const selectedCategory =
                exportCategorySelect.value;


            let filtered = payments;

            let fileSuffix =
                'All_Categories';


            if (selectedCategory !== 'all') {

                filtered =
                    payments.filter(
                        p =>
                            p.category
                                .toLowerCase() ===
                            selectedCategory
                                .toLowerCase()
                    );


                fileSuffix =
                    selectedCategory;

            }


            downloadCSV(
                filtered,
                `Coursado_Payments_Category_${fileSuffix}.csv`
            );

        }
    );


    // =========================================================
    // EXCEL / CSV IMPORT & FILE-TITLE CATEGORIZATION
    // =========================================================

    const openImportBtn = document.getElementById('openImportBtn');
    const importDropZone = document.getElementById('importDropZone');
    const excelFileInput = document.getElementById('excelFileInput');
    const importPreviewModal = document.getElementById('importPreviewModal');
    const closeImportPreview = document.getElementById('closeImportPreview');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const importPreviewBody = document.getElementById('importPreviewBody');
    const importSummary = document.getElementById('importSummary');
    const importStatus = document.getElementById('importStatus');

    let parsedImportData = [];

    openImportBtn.addEventListener('click', () => excelFileInput.click());
    importDropZone.addEventListener('click', () => excelFileInput.click());

    importDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        importDropZone.style.borderColor = 'var(--primary)';
        importDropZone.style.background = '#e0f2fe';
    });

    importDropZone.addEventListener('dragleave', () => {
        importDropZone.style.borderColor = '#cbd5e1';
        importDropZone.style.background = '#f8fafc';
    });

    importDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        importDropZone.style.borderColor = '#cbd5e1';
        importDropZone.style.background = '#f8fafc';
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    excelFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function getCategoryFromFileTitle(fileName) {
        const fname = String(fileName || '').trim().toLowerCase();
        
        if (fname.startsWith('m.')) return 'Movers';
        if (fname.startsWith('f.')) return 'Flyers';
        if (fname.startsWith('k.')) return 'Kiddos';
        if (fname.startsWith('j.')) return 'Juniors';
        if (fname.startsWith('b.')) return 'Beginners';
        if (fname.startsWith('s.')) return 'Supers';
        
        return 'Other';
    }

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet);

                if (rows.length === 0) {
                    alert('The uploaded file is empty.');
                    return;
                }

                const category = getCategoryFromFileTitle(file.name);

                parsedImportData = rows.map((row, index) => {
                    const getVal = (possibleKeys) => {
                        for (const key of Object.keys(row)) {
                            const cleanedKey = key.trim().toLowerCase();
                            if (possibleKeys.includes(cleanedKey)) {
                                return row[key];
                            }
                        }
                        return null;
                    };

                    const rawName = getVal(['names', 'name', 'student name', 'student_name']) || 'Unknown Student';
                    const rawFeeVal = getVal(['fees', 'fee', 'amount', 'paid', 'price']) || 0;
                    const rawAmount = parseFloat(rawFeeVal);
                    
                    const rawDate = getVal(['date']) || new Date().toISOString().split('T')[0];
                    const rawMethod = getVal(['method', 'payment method']) || 'Cash';

                    return {
                        id: Date.now() + index,
                        name: String(rawName).trim(),
                        category: category,
                        amount: isNaN(rawAmount) ? 0 : rawAmount,
                        method: String(rawMethod).trim(),
                        date: String(rawDate).split('T')[0]
                    };
                });

                renderImportPreview();
                importPreviewModal.style.display = 'flex';
            } catch (err) {
                console.error(err);
                alert('Error parsing file. Please make sure it is a valid Excel or CSV file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function renderImportPreview() {
        importPreviewBody.innerHTML = '';
        parsedImportData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td><span class="method-badge">${escapeHtml(item.category)}</span></td>
                <td style="color:#059669; font-weight:600;">EGP ${item.amount.toLocaleString()}</td>
                <td>${escapeHtml(item.date)}</td>
                <td><span style="color:#10b981;"><i class="fa-solid fa-check"></i> Ready</span></td>
            `;
            importPreviewBody.appendChild(row);
        });
        importSummary.innerHTML = `<strong>Total records detected:</strong> ${parsedImportData.length}`;
    }

    closeImportPreview.addEventListener('click', () => { importPreviewModal.style.display = 'none'; });
    cancelImportBtn.addEventListener('click', () => { importPreviewModal.style.display = 'none'; });

    confirmImportBtn.addEventListener('click', () => {
        if (parsedImportData.length === 0) return;

        payments = [...parsedImportData, ...payments];
        saveAndRender();

        importPreviewModal.style.display = 'none';
        excelFileInput.value = '';
        importStatus.innerHTML = `<span style="color:#10b981; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Successfully imported ${parsedImportData.length} student records!</span>`;
    });


    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeHtml(str) {

        return String(str)
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );

    }


    // =========================================================
    // INITIAL RENDER
    // =========================================================

    renderAllViews();

});