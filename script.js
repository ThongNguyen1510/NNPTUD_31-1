// Khởi tạo các biến toàn cục
let allProducts = [];       // Chứa toàn bộ dữ liệu từ API
let filteredProducts = [];  // Chứa dữ liệu sau khi tìm kiếm/sắp xếp
let currentPage = 1;
let itemsPerPage = 10;

// Hàm Main: Gọi API và khởi chạy
async function getAll() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        allProducts = await response.json();
        
        // Ban đầu filtered giống all
        filteredProducts = [...allProducts];
        
        renderTable();
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        alert('Không thể tải dữ liệu sản phẩm.');
    }
}

// Hàm render dữ liệu ra bảng HTML
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredProducts.slice(startIndex, endIndex);

    // Loop qua từng sản phẩm để tạo dòng
    currentItems.forEach((product, index) => {
        const row = document.createElement('tr');
        
        // Logic dòng Đen/Trắng:
        // Dòng chẵn (theo index hiển thị) -> Đen, Lẻ -> Trắng
        // Lưu ý: index bắt đầu từ 0
        if (index % 2 === 0) {
            row.classList.add('row-white'); // 0, 2, 4... (Dòng 1, 3, 5...) -> Để màu trắng cho dễ nhìn dòng đầu
        } else {
            row.classList.add('row-black'); // 1, 3, 5... (Dòng 2, 4, 6...) -> Màu đen
        }

        // Xử lý hình ảnh (API này đôi khi trả về chuỗi JSON lỗi, cần clean)
        let imagesHtml = '<div class="image-gallery">';
        if (Array.isArray(product.images)) {
            product.images.forEach(img => {
                // Clean URL (loại bỏ ngoặc vuông hoặc nháy kép thừa nếu có trong string url)
                let cleanUrl = img.replace(/[\[\]"]/g, '');
                imagesHtml += `<img src="${cleanUrl}" class="product-img" onerror="this.style.display='none'">`;
            });
        }
        imagesHtml += '</div>';

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${imagesHtml}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
        `;

        tableBody.appendChild(row);
    });

    // Cập nhật thông tin phân trang
    document.getElementById('pageInfo').innerText = `Trang ${currentPage} / ${Math.ceil(filteredProducts.length / itemsPerPage) || 1}`;
    
    // Disable nút nếu cần
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= Math.ceil(filteredProducts.length / itemsPerPage);
}

// ---------------------------------------------------------
// TÍNH NĂNG 1: TÌM KIẾM (ONCHANGE)
// ---------------------------------------------------------
document.getElementById('searchInput').addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    
    filteredProducts = allProducts.filter(p => 
        p.title.toLowerCase().includes(keyword)
    );
    
    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    renderTable();
});

// ---------------------------------------------------------
// TÍNH NĂNG 2: PHÂN TRANG (5, 10, 20)
// ---------------------------------------------------------
document.getElementById('itemsPerPage').addEventListener('change', function(e) {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset về trang 1
    renderTable();
});

function changePage(step) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const newPage = currentPage + step;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
    }
}

// ---------------------------------------------------------
// TÍNH NĂNG 3: SẮP XẾP
// ---------------------------------------------------------
function sortData(key, direction) {
    // Sắp xếp mảng filteredProducts
    filteredProducts.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Nếu là chữ thì chuyển về thường để so sánh
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1; // Reset về trang 1 khi sắp xếp
    renderTable();
}

// Khởi chạy ứng dụng khi load trang
getAll();