import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Executing Phase 2 Complete Seed Script for KTP CAD Library...');

  // 1. Roles & Permissions
  const rolesData = [
    { id: 1, name: 'ADMIN', description: 'Toàn quyền quản trị hệ thống' },
    { id: 2, name: 'TECHNICAL', description: 'Kỹ thuật viên quản lý file CAD & phiên bản' },
    { id: 3, name: 'SALES', description: 'Nhân viên kinh doanh hỗ trợ đơn hàng & chăm sóc khách' },
    { id: 4, name: 'USER', description: 'Khách hàng mua & tải bản vẽ CAD' }
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r
    });
  }

  // 2. Users
  const passwordHash = await bcrypt.hash('123456', 10);
  const usersData = [
    { id: 1, name: 'KTP Admin', email: 'admin@ktp.vn', phone: '0901234567', roleId: 1 },
    { id: 2, name: 'KTP Technical Engineer', email: 'tech@ktp.vn', phone: '0902345678', roleId: 2 },
    { id: 3, name: 'KTP Sales Lead', email: 'sales@ktp.vn', phone: '0903456789', roleId: 3 },
    { id: 4, name: 'Công ty Cơ Khí Nam Phát', email: 'namphat@gmail.com', phone: '0988776655', roleId: 4 }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone, roleId: u.roleId },
      create: { ...u, passwordHash }
    });
  }

  // 3. Categories
  const categoriesData = [
    { id: 1, name: 'Bản vẽ Thiết kế Máy', slug: 'may-thiet-ke', type: 'MACHINE', description: 'Bộ hồ sơ thiết kế máy & dây chuyền sản xuất hoàn chỉnh' },
    { id: 2, name: 'Bản vẽ Phụ tùng / Linh kiện', slug: 'phu-tung', type: 'PART', description: 'Bản vẽ 2D/3D chi tiết phụ tùng và linh kiện kỹ thuật' },
    { id: 10, name: 'Máy ngành gạch', slug: 'may-nganh-gach', parentId: 1, type: 'MACHINE', description: 'Máy cắt, bo, mài gạch tự động' },
    { id: 11, name: 'Máy ngành đá', slug: 'may-nganh-da', parentId: 1, type: 'MACHINE', description: 'Máy xẻ, mài, vạt cạnh đá granite & marble' },
    { id: 12, name: 'Máy Waterjet / CNC', slug: 'waterjet-cnc', parentId: 1, type: 'MACHINE', description: 'Máy cắt tia nước & gia công CNC 3-5 trục' },
    { id: 13, name: 'Máy nhập khẩu', slug: 'may-nhap-khau', parentId: 1, type: 'MACHINE', description: 'Bản vẽ máy nhập khẩu đã xác minh quyền thương mại' },
    { id: 20, name: 'Máy cắt gạch', slug: 'may-cat-gach', parentId: 10, type: 'MACHINE', description: 'Dòng máy cắt gạch đa lưỡi tự động' },
    { id: 21, name: 'Máy bo gạch', slug: 'may-bo-gach', parentId: 10, type: 'MACHINE', description: 'Máy bo gạch len tường, bo thô' },
    { id: 22, name: 'Máy xẻ đá', slug: 'may-xe-da', parentId: 11, type: 'MACHINE', description: 'Máy xẻ đá khối, xẻ đá dây chuyền' },
    { id: 30, name: 'Phụ tùng Waterjet', slug: 'phu-tung-waterjet', parentId: 2, type: 'PART', description: 'Linh kiện thay thế cho hệ thống cắt tia nước' },
    { id: 31, name: 'Orifice (Lỗ phun)', slug: 'orifice', parentId: 30, type: 'PART', description: 'Ruby, Diamond, Sapphire Orifice' },
    { id: 32, name: 'Nozzle (Vòi phun)', slug: 'nozzle', parentId: 30, type: 'PART', description: 'Đầu vòi phun Paser, P-II, P-III' },
    { id: 33, name: 'Sealing (Bộ bịt kín)', slug: 'sealing', parentId: 30, type: 'PART', description: 'Đầu bịt kín, Sealing Head, Body' },
    { id: 34, name: 'Valve (Van)', slug: 'valve', parentId: 30, type: 'PART', description: 'Van hút, van phân phối' },
    { id: 35, name: 'Filter (Bộ lọc)', slug: 'filter', parentId: 30, type: 'PART', description: 'Lõi lọc 1 Micron, cartridge filter' },
    { id: 36, name: 'Fitting & Swivel', slug: 'fitting', parentId: 30, type: 'PART', description: 'Khớp xoay, đai ốc HP' },
    { id: 37, name: 'Pump & Booster', slug: 'pump-booster', parentId: 30, type: 'PART', description: 'Bộ tăng áp, linh kiện bơm HP' },
    { id: 38, name: 'Tooling & Accessories', slug: 'tooling', parentId: 30, type: 'PART', description: 'Bộ dụng cụ ren, uốn cong' }
  ];

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, type: c.type, description: c.description, parentId: c.parentId },
      create: c
    });
  }

  // Helper for adding machines with deduplication logic
  async function seedMachine({ name, code, cadCode, price, categoryIds, rightsStatus = 'OWNED', specs = {}, desc = '' }) {
    // Rule check: Cannot publish if rights status is UNKNOWN or NOT_FOR_SALE
    const canPublish = ['OWNED', 'LICENSED', 'AUTHORIZED'].includes(rightsStatus);
    const status = canPublish ? 'PUBLISHED' : 'DRAFT';
    const slug = cadCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let product = await prisma.product.findUnique({ where: { cadCode } });

    if (!product) {
      product = await prisma.product.create({
        data: {
          productName: name.startsWith('Bản vẽ ') ? name : `Bản vẽ ${name}`,
          productCode: code,
          cadCode: cadCode,
          slug: slug,
          productType: 'COMPLETE_MACHINE',
          description: desc || `Bộ hồ sơ bản vẽ thiết kế máy ${name} (${code}) chuẩn kỹ thuật KTP. Đầy đủ bản vẽ lắp ráp, chi tiết, 3D STEP và BOM vật tư.`,
          technicalSpecs: JSON.stringify({
            "Công suất motor": specs.power || "7.5 kW - 15 kW",
            "Kích thước gia công": specs.size || "1200 x 2400 mm",
            "Tốc độ": specs.speed || "2 - 8 m/phút",
            "Định dạng file": "PDF, DWG, DXF, STEP (3D)",
            "Số lượng bản vẽ": specs.drawings || "45 - 85 bản vẽ",
            "Dung lượng bộ file": specs.fileSize || "350 MB"
          }),
          rightsStatus: rightsStatus,
          status: status,
          featured: ['CAD-MBG023', 'CAD-MCT025', 'CAD-WATEJET-SHUTTLE', 'CAD-MCD800'].includes(cadCode)
        }
      });

      // Create Packages for machine
      const pdfPrice = Math.round((price * 0.35) / 100000) * 100000;
      const cadPrice = Math.round((price * 0.70) / 100000) * 100000;

      const pkgPdf = await prisma.productPackage.create({
        data: {
          productId: product.id,
          packageName: 'GÓI PDF BASIC',
          packageCode: 'PDF_BASIC',
          price: pdfPrice,
          description: 'Bao gồm PDF bản vẽ tổng thể, bản vẽ lắp & thông số kỹ thuật cơ bản. Phù hợp xem & khảo sát.'
        }
      });
      const pkgCad = await prisma.productPackage.create({
        data: {
          productId: product.id,
          packageName: 'GÓI CAD STANDARD',
          packageCode: 'CAD_STANDARD',
          price: cadPrice,
          description: 'Bao gồm PDF + bản vẽ DWG/DXF 2D chi tiết từng cụm & chi tiết bộc lót gia công.'
        }
      });
      const pkgFull = await prisma.productPackage.create({
        data: {
          productId: product.id,
          packageName: 'GÓI FULL ENGINEERING PRO',
          packageCode: 'FULL_PRO',
          price: price,
          description: 'Đầy đủ trọn bộ: PDF, DWG, DXF, 3D STEP Assembly, BOM vật tư, Hồ sơ điện & Hướng dẫn lắp ráp.'
        }
      });

      // Create Version V1.0
      const versionObj = await prisma.version.create({
        data: {
          productId: product.id,
          version: 'V1.0',
          changeNote: 'Bản phát hành chuẩn hóa kỹ thuật đầu tiên từ thư viện KTP CAD.',
          createdById: 1,
          status: 'ACTIVE'
        }
      });

      // Attach 9 folder structure sample files
      const sampleFiles = [
        { name: 'General_Assembly.pdf', type: 'PDF', folder: '01_GENERAL', pkgId: pkgPdf.id },
        { name: 'General_Drawing.dwg', type: 'DWG', folder: '01_GENERAL', pkgId: pkgCad.id },
        { name: 'Assembly_01.pdf', type: 'PDF', folder: '02_ASSEMBLY', pkgId: pkgPdf.id },
        { name: 'Assembly_01.dwg', type: 'DWG', folder: '02_ASSEMBLY', pkgId: pkgCad.id },
        { name: 'Part_001.pdf', type: 'PDF', folder: '03_PART_DRAWINGS', pkgId: pkgCad.id },
        { name: 'Part_001.dwg', type: 'DWG', folder: '03_PART_DRAWINGS', pkgId: pkgCad.id },
        { name: 'Welding_Structure.pdf', type: 'PDF', folder: '04_FABRICATION', pkgId: pkgFull.id },
        { name: 'Cutting_List.xlsx', type: 'XLSX', folder: '04_FABRICATION', pkgId: pkgFull.id },
        { name: 'Electrical_Diagram.pdf', type: 'PDF', folder: '05_ELECTRICAL', pkgId: pkgFull.id },
        { name: 'BOM_Material_List.xlsx', type: 'XLSX', folder: '06_BOM', pkgId: pkgFull.id },
        { name: 'Assembly_Complete.step', type: 'STEP', folder: '07_3D', pkgId: pkgFull.id },
        { name: 'Installation_Guide.pdf', type: 'PDF', folder: '08_MANUAL', pkgId: pkgFull.id },
        { name: 'Revision_History.pdf', type: 'PDF', folder: '09_REVISION', pkgId: pkgFull.id }
      ];

      for (const f of sampleFiles) {
        await prisma.file.create({
          data: {
            productId: product.id,
            packageId: f.pkgId,
            versionId: versionObj.id,
            fileName: f.name,
            fileType: f.type,
            folderCategory: f.folder,
            storagePath: `/storage/private_cad/${cadCode}/${f.folder}/${f.name}`,
            fileSize: Math.floor(Math.random() * 15000000) + 500000,
            checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            visibility: 'PRIVATE'
          }
        });
      }
    }

    // Link Categories via product_categories N-N junction table
    for (const catId of categoryIds) {
      const exists = await prisma.productCategory.findUnique({
        where: { productId_categoryId: { productId: product.id, categoryId: catId } }
      });
      if (!exists) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: catId }
        });
      }
    }
  }

  // --- Seed Brick Machines (17 items) ---
  const brickMachines = [
    { name: 'MÁY CẮT GẠCH ĐÁ DÂY CHUYỀN TỰ ĐỘNG MCT 025', code: 'MCT 025', cadCode: 'CAD-MCT025', price: 12900000, cats: [10, 20] },
    { name: 'Máy líp cạnh gạch đá Venus 024P', code: 'VENUS 024P', cadCode: 'CAD-VENUS024P', price: 12900000, cats: [10, 21] },
    { name: 'Máy cắt gạch MCG 023-1', code: 'MCG 023-1', cadCode: 'CAD-MCG023-1', price: 5900000, cats: [10, 20] },
    { name: 'Máy cắt gạch đẩy bàn MCG800', code: 'MCG800', cadCode: 'CAD-MCG800', price: 3900000, cats: [10, 20] },
    { name: 'Máy bo gạch len tường tự động MBG-020', code: 'MBG-020', cadCode: 'CAD-MBG020', price: 9900000, cats: [10, 21] },
    { name: 'Máy mài gạch thẻ trang trí MHL_023', code: 'MHL_023', cadCode: 'CAD-MHL023', price: 7900000, cats: [10] },
    { name: 'Máy cắt gạch MCG-022', code: 'MCG-022', cadCode: 'CAD-MCG022', price: 5900000, cats: [10, 20] },
    { name: 'Máy bo gạch tự động MBG-022', code: 'MBG-022', cadCode: 'CAD-MBG022', price: 8900000, cats: [10, 21] },
    { name: 'Máy cắt gạch dây chuyền nhiều lưỡi MCS 023', code: 'MCS 023', cadCode: 'CAD-MCS023', price: 9900000, cats: [10, 20] },
    { name: 'Máy cắt gạch MCG-019 D180', code: 'MCG-019 D180', cadCode: 'CAD-MCG019-D180', price: 4900000, cats: [10, 20] },
    { name: 'Máy cắt gạch MCG-019', code: 'MCG-019', cadCode: 'CAD-MCG019', price: 4900000, cats: [10, 20] },
    { name: 'Máy bo thô tự động BT-85', code: 'BT-85', cadCode: 'CAD-BT85', price: 6900000, cats: [10, 21] },
    { name: 'BÀN CẮT GẠCH ĐẨY TAY KTP', code: 'KTP-BAN-CAT-GACH', cadCode: 'CAD-KTP-BAN-CAT-GACH', price: 1900000, cats: [10, 20] },
    { name: 'Máy cắt gạch MCG.017', code: 'MCG.017', cadCode: 'CAD-MCG017', price: 4500000, cats: [10, 20] },
    { name: 'Máy cắt gạch đẩy bàn MCG-021', code: 'MCG-021', cadCode: 'CAD-MCG021', price: 4900000, cats: [10, 20] },
    { name: 'Máy bo gạch tự động MBG-023', code: 'MBG-023', cadCode: 'CAD-MBG023', price: 9900000, cats: [10, 21] },
    { name: 'Máy cắt gạch MOSOAIC', code: 'MOSOAIC', cadCode: 'CAD-MOSOAIC', price: 9900000, cats: [10, 20] }
  ];

  for (const m of brickMachines) {
    await seedMachine({ ...m, categoryIds: m.cats });
  }

  // --- Seed Stone Machines (10 items - Deduplication tested) ---
  const stoneMachines = [
    { name: 'MÁY CẮT GẠCH ĐÁ DÂY CHUYỀN TỰ ĐỘNG MCT 025', code: 'MCT 025', cadCode: 'CAD-MCT025', price: 12900000, cats: [11] },
    { name: 'Máy cắt tia nước 5 trục AC WATEJET - SHUTTLE', code: 'WATEJET-SHUTTLE', cadCode: 'CAD-WATEJET-SHUTTLE', price: 19900000, cats: [11, 12] },
    { name: 'Máy mài, vác cạnh đá hoa cương MHL-0231', code: 'MHL-0231', cadCode: 'CAD-MHL0231', price: 12900000, cats: [11] },
    { name: 'Máy cắt tia nước 5 trục AC WATEJET-YINGTUO', code: 'WATEJET-YINGTUO', cadCode: 'CAD-WATEJET-YINGTUO', price: 19900000, cats: [11, 12] },
    { name: 'Máy xẻ đá khối MCD800', code: 'MCD800', cadCode: 'CAD-MCD800', price: 5900000, cats: [11, 22] },
    { name: 'Máy xẻ đá dây chuyền MCDS', code: 'MCDS', cadCode: 'CAD-MCDS', price: 9900000, cats: [11, 22] },
    { name: 'Máy xẻ đá khối MCD1650', code: 'MCD1650', cadCode: 'CAD-MCD1650', price: 12900000, cats: [11, 22] },
    { name: 'Máy cắt gạch dây chuyền nhiều lưỡi MCS 023', code: 'MCS 023', cadCode: 'CAD-MCS023', price: 9900000, cats: [11] },
    { name: 'Máy cắt đá MCD500', code: 'MCD500', cadCode: 'CAD-MCD500', price: 4900000, cats: [11] },
    { name: 'MÁY CẮT CẦU KTP 600', code: 'KTP 600', cadCode: 'CAD-KTP600', price: 14900000, cats: [11] }
  ];

  for (const m of stoneMachines) {
    await seedMachine({ ...m, categoryIds: m.cats });
  }

  // --- Seed Imported Machines (8 items - Rights status verified) ---
  const importedMachines = [
    { name: 'Máy cắt tia nước CNC 5 trục', code: 'CNC-WJ-5AXIS', cadCode: 'CAD-CNC-WJ-5AXIS', price: 19900000, cats: [13, 12], rightsStatus: 'UNKNOWN' },
    { name: 'Máy cắt CNC bằng tia nước 3 trục', code: 'CNC-WJ-3AXIS', cadCode: 'CAD-CNC-WJ-3AXIS', price: 14900000, cats: [13, 12], rightsStatus: 'UNKNOWN' },
    { name: 'Máy cắt kính CNC 3 trục', code: 'CNC-GLASS-3AXIS', cadCode: 'CAD-CNC-GLASS-3AXIS', price: 12900000, cats: [13], rightsStatus: 'UNKNOWN' },
    { name: 'Máy cắt tia nước 5 trục AC WATEJET - SHUTTLE', code: 'WATEJET-SHUTTLE', cadCode: 'CAD-WATEJET-SHUTTLE', price: 19900000, cats: [13], rightsStatus: 'UNKNOWN' },
    { name: 'Máy đánh bóng cạnh mặt bàn thạch anh tự động', code: 'KTP-QUARTZ-EDGE', cadCode: 'CAD-KTP-QUARTZ-EDGE', price: 14900000, cats: [13], rightsStatus: 'UNKNOWN' },
    { name: 'Máy phay và cắt bàn tròn KTP-1500', code: 'KTP-1500', cadCode: 'CAD-KTP1500', price: 7900000, cats: [13], rightsStatus: 'OWNED' },
    { name: 'Máy cắt tia nước 5 trục AC WATEJET-YINGTUO', code: 'WATEJET-YINGTUO', cadCode: 'CAD-WATEJET-YINGTUO', price: 19900000, cats: [13], rightsStatus: 'UNKNOWN' },
    { name: 'MÁY CẮT CẦU KTP 600', code: 'KTP 600', cadCode: 'CAD-KTP600', price: 14900000, cats: [13], rightsStatus: 'OWNED' }
  ];

  for (const m of importedMachines) {
    await seedMachine({ ...m, categoryIds: m.cats, rightsStatus: m.rightsStatus });
  }

  // --- Seed Waterjet Spare Parts (41 items) ---
  const waterjetParts = [
    { name: 'Bình cát tự động', partNo: 'CAD-WJ-ABRASIVE-TANK', cadCode: 'CAD-WJ-ABRASIVE-TANK', price: 1900000, catId: 30 },
    { name: 'Xi lanh 72120023 HP', partNo: '72120023', cadCode: 'CAD-WJ-CYL-72120023', price: 1200000, catId: 36 },
    { name: 'Vòi phun nước kim cương Paser 4 60K 015849-xx', partNo: '015849-xx', cadCode: 'CAD-WJ-PASER4-DIAMOND-015849', price: 600000, catId: 32 },
    { name: 'Lỗ phun nước Paser 4 Ruby Orifice 041759-10', partNo: '041759-10', cadCode: 'CAD-WJ-RUBY-041759-10', price: 350000, catId: 31 },
    { name: 'Đai ốc xi lanh HP 05059688', partNo: '05059688', cadCode: 'CAD-WJ-NUT-05059688', price: 250000, catId: 36 },
    { name: 'Lỗ phun nước khối lượng thấp 003788-xx', partNo: '003788-xx', cadCode: 'CAD-WJ-ORIFICE-003788', price: 300000, catId: 31 },
    { name: 'Đai ốc xi lanh UHP 72101164', partNo: '72101164', cadCode: 'CAD-WJ-NUT-72101164', price: 300000, catId: 36 },
    { name: 'Bộ đầu bịt kín HP 20480087', partNo: '20480087', cadCode: 'CAD-WJ-SEAL-20480087', price: 1200000, catId: 33 },
    { name: 'Bộ phận đầu bịt kín 20480113', partNo: '20480113', cadCode: 'CAD-WJ-SEAL-20480113', price: 900000, catId: 33 },
    { name: 'Dụng cụ cắt tia nước 400029-8', partNo: '400029-8', cadCode: 'CAD-WJ-TOOL-400029-8', price: 700000, catId: 38 },
    { name: 'Bộ dụng cụ ren máy cắt tia nước', partNo: 'WJ-THREAD-TOOL', cadCode: 'CAD-WJ-THREAD-TOOL', price: 1200000, catId: 38 },
    { name: 'Bộ dụng cụ uốn cong thủ công hình nón và ren bằng tia nước', partNo: 'WJ-CONE-BEND-TOOL', cadCode: 'CAD-WJ-CONE-BEND-TOOL', price: 1200000, catId: 38 },
    { name: 'Bộ phận bơm tia nước bể lọc 606115-20', partNo: '606115-20', cadCode: 'CAD-WJ-PUMP-606115-20', price: 1000000, catId: 37 },
    { name: 'Bộ lọc thủy lực trả về 9x Bộ phận bơm tia nước 400035-1', partNo: '400035-1', cadCode: 'CAD-WJ-FILTER-400035-1', price: 800000, catId: 35 },
    { name: 'Lõi lọc 1 Micron xếp nếp 20', partNo: 'FILTER-1MICRON-20', cadCode: 'CAD-WJ-FILTER-1MICRON-20', price: 250000, catId: 35 },
    { name: 'Lõi Lọc 1 Micron Xếp Ly 10 400023-1-1P', partNo: '400023-1-1P', cadCode: 'CAD-WJ-FILTER-400023-1-1P', price: 300000, catId: 35 },
    { name: 'Lắp ráp khớp xoay thẳng D0222AA-00RIC', partNo: 'D0222AA-00RIC', cadCode: 'CAD-WJ-SWIVEL-D0222AA-00RIC', price: 700000, catId: 36 },
    { name: 'Bộ lọc hộp mực 1 micron 10 inch 400023-1-1', partNo: '400023-1-1', cadCode: 'CAD-WJ-CARTRIDGE-400023-1-1', price: 350000, catId: 35 },
    { name: 'Bộ lọc hộp mực 222 Kiểu nắp phẳng 400023-1-1S', partNo: '400023-1-1S', cadCode: 'CAD-WJ-CARTRIDGE-400023-1-1S', price: 350000, catId: 35 },
    { name: 'Tia nước Lỗ kim cương 201940-xx', partNo: '201940-xx', cadCode: 'CAD-WJ-DIAMOND-201940', price: 350000, catId: 31 },
    { name: 'Bộ phận đầu phun nước 203502-xx P4 Ruby Orifice', partNo: '203502-xx', cadCode: 'CAD-WJ-P4-RUBY-203502', price: 500000, catId: 31 },
    { name: 'Cuộn dây và giá đỡ HP cho Robot KUKA', partNo: 'KUKA-HP-BRACKET', cadCode: 'CAD-WJ-KUKA-HP-BRACKET', price: 1500000, catId: 38 },
    { name: 'Vòi phun bậc kim cương Đầu phun nước 201601-xx P-II', partNo: '201601-xx', cadCode: 'CAD-WJ-DIAMOND-P2-201601', price: 400000, catId: 32 },
    { name: 'Lỗ phun nước Lỗ phun Ruby 203920-xx', partNo: '203920-xx', cadCode: 'CAD-WJ-RUBY-203920', price: 350000, catId: 31 },
    { name: 'Đầu niêm phong Thân 05144357', partNo: '05144357', cadCode: 'CAD-WJ-SEAL-BODY-05144357', price: 600000, catId: 33 },
    { name: 'Tip cỡ trung 25mm 10605 Prog.', partNo: '10605', cadCode: 'CAD-WJ-TIP-10605', price: 250000, catId: 32 },
    { name: 'Phụ tùng máy phun nước Sugino', partNo: 'SUGINO-PARTS', cadCode: 'CAD-WJ-SUGINO-PARTS', price: 1500000, catId: 30 },
    { name: 'Lắp ráp IDE II 204779590013', partNo: '204779590013', cadCode: 'CAD-WJ-IDE-II-204779590013', price: 1200000, catId: 32 },
    { name: 'Bộ vòi phun P-III 009519-xx + Ruby Orifice 203501-xx', partNo: '009519-xx', cadCode: 'CAD-WJ-P3-009519-203501', price: 1000000, catId: 32 },
    { name: 'Lỗ phun nước Sapphire 202402-13', partNo: '202402-13', cadCode: 'CAD-WJ-SAPPHIRE-202402-13', price: 350000, catId: 31 },
    { name: 'Lỗ kim cương thân dài 20459532 / 201401-10', partNo: '20459532', cadCode: 'CAD-WJ-LONG-DIAMOND-20459532', price: 500000, catId: 31 },
    { name: 'Vòi phun nước Ruby Orifice 203940-xx', partNo: '203940-xx', cadCode: 'CAD-WJ-RUBY-203940', price: 350000, catId: 31 },
    { name: 'Van hút nhóm D28 DT954-00', partNo: 'DT954-00', cadCode: 'CAD-WJ-VALVE-D28-DT954', price: 700000, catId: 34 },
    { name: 'Bộ dụng cụ sửa chữa, Nhóm van phân phối hút', partNo: 'VALVE-REPAIR-KIT', cadCode: 'CAD-WJ-VALVE-REPAIR-KIT', price: 1500000, catId: 34 },
    { name: 'Lỗ kim cương tia nước', partNo: 'DIAMOND-ORIFICE', cadCode: 'CAD-WJ-DIAMOND-ORIFICE', price: 300000, catId: 31 },
    { name: 'Bộ phận đầu bịt kín 72154603', partNo: '72154603', cadCode: 'CAD-WJ-SEAL-72154603', price: 600000, catId: 33 },
    { name: 'Bộ phận đầu bịt kín 05144688', partNo: '05144688', cadCode: 'CAD-WJ-SEAL-05144688', price: 600000, catId: 33 },
    { name: 'Bộ phận đầu bịt kín 20417081', partNo: '20417081', cadCode: 'CAD-WJ-SEAL-20417081', price: 600000, catId: 33 },
    { name: 'Đầu niêm phong 72113373 Sealing Head', partNo: '72113373', cadCode: 'CAD-WJ-SEALING-HEAD-72113373', price: 700000, catId: 33 },
    { name: 'Đầu niêm phong thân 20479524 (Sealing Head Body)', partNo: '20479524', cadCode: 'CAD-WJ-SEALING-BODY-20479524', price: 700000, catId: 33 },
    { name: 'Bộ tăng áp RC114319NN', partNo: 'RC114319NN', cadCode: 'CAD-WJ-BOOSTER-RC114319NN', price: 1500000, catId: 37 }
  ];

  for (const pt of waterjetParts) {
    const slug = pt.cadCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let product = await prisma.product.findUnique({ where: { cadCode: pt.cadCode } });

    if (!product) {
      product = await prisma.product.create({
        data: {
          productName: pt.name.startsWith('Bản vẽ ') ? pt.name : `Bản vẽ ${pt.name}`,
          productCode: pt.partNo,
          cadCode: pt.cadCode,
          slug: slug,
          productType: 'PART_DRAWING',
          description: `Bản vẽ chi tiết phụ tùng KTP ${pt.name} (Part No: ${pt.partNo}). Đầy đủ kích thước gia công, dung sai lắp ghép & file 3D STEP chuẩn.`,
          technicalSpecs: JSON.stringify({
            "Mã phụ tùng (Part No)": pt.partNo,
            "Vật liệu chế tạo": "Stainless Steel 316 / Tungsten Carbide / Sapphire",
            "Áp suất chịu đựng": "Thường 55,000 - 87,000 PSI",
            "Định dạng file": "PDF, DWG, DXF, STEP",
            "Mức độ hoàn thiện": "Bản vẽ chế tạo chi tiết"
          }),
          rightsStatus: 'OWNED',
          status: 'PUBLISHED',
          featured: [31, 32, 33, 40].some(id => pt.cadCode.includes(id))
        }
      });

      const pkgPart = await prisma.productPackage.create({
        data: {
          productId: product.id,
          packageName: 'GÓI PART STANDARD',
          packageCode: 'PART_STANDARD',
          price: pt.price,
          description: 'Bao gồm trọn bộ: PDF 2D dimension drawing, DWG/DXF cutting profile & file 3D STEP.'
        }
      });

      const versionObj = await prisma.version.create({
        data: {
          productId: product.id,
          version: 'V1.0',
          changeNote: 'Bản vẽ phụ tùng tiêu chuẩn phát hành lần đầu.',
          createdById: 1,
          status: 'ACTIVE'
        }
      });

      await prisma.file.createMany({
        data: [
          {
            productId: product.id,
            packageId: pkgPart.id,
            versionId: versionObj.id,
            fileName: `${pt.cadCode}_2D_Drawing.pdf`,
            fileType: 'PDF',
            folderCategory: '01_DRAWINGS',
            storagePath: `/storage/private_cad/parts/${pt.cadCode}_2D_Drawing.pdf`,
            fileSize: 1250000,
            checksum: 'abc123partpdf',
            visibility: 'PRIVATE'
          },
          {
            productId: product.id,
            packageId: pkgPart.id,
            versionId: versionObj.id,
            fileName: `${pt.cadCode}_Profile.dwg`,
            fileType: 'DWG',
            folderCategory: '01_DRAWINGS',
            storagePath: `/storage/private_cad/parts/${pt.cadCode}_Profile.dwg`,
            fileSize: 2840000,
            checksum: 'abc123partdwg',
            visibility: 'PRIVATE'
          },
          {
            productId: product.id,
            packageId: pkgPart.id,
            versionId: versionObj.id,
            fileName: `${pt.cadCode}_Model.step`,
            fileType: 'STEP',
            folderCategory: '07_3D',
            storagePath: `/storage/private_cad/parts/${pt.cadCode}_Model.step`,
            fileSize: 5400000,
            checksum: 'abc123partstep',
            visibility: 'PRIVATE'
          }
        ]
      });

      // Junction table with unique category IDs
      const uniqueCatIds = Array.from(new Set([pt.catId, 30]));
      for (const catId of uniqueCatIds) {
        const exists = await prisma.productCategory.findUnique({
          where: { productId_categoryId: { productId: product.id, categoryId: catId } }
        });
        if (!exists) {
          await prisma.productCategory.create({
            data: { productId: product.id, categoryId: catId }
          });
        }
      }
    }
  }

  // --- Seed Sample Paid Order & License (Rule test: downloadLimit = 5, validUntil = 30 days) ---
  const sampleProduct = await prisma.product.findUnique({ where: { cadCode: 'CAD-MBG023' } });
  const samplePackage = await prisma.productPackage.findFirst({ where: { productId: sampleProduct.id, packageCode: 'FULL_PRO' } });

  const existingOrder = await prisma.order.findUnique({ where: { orderCode: 'KTP-ORD-88291' } });
  if (!existingOrder && sampleProduct && samplePackage) {
    const paidAt = new Date(Date.now() - 86400000 * 2); // Paid 2 days ago
    const validUntil = new Date(paidAt.getTime() + 86400000 * 30); // 30 days validity as specified in Phase 2

    const order = await prisma.order.create({
      data: {
        userId: 4,
        orderCode: 'KTP-ORD-88291',
        subtotal: 9900000,
        discount: 0,
        total: 9900000,
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        createdAt: paidAt
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: sampleProduct.id,
        packageId: samplePackage.id,
        price: 9900000,
        quantity: 1
      }
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: 'VIETQR',
        transactionCode: 'FT26248912903',
        amount: 9900000,
        status: 'SUCCESS',
        paidAt: paidAt
      }
    });

    // Create License with Phase 2 rules: downloadLimit = 5, validUntil = paidAt + 30 days
    await prisma.license.create({
      data: {
        userId: 4,
        orderId: order.id,
        productId: sampleProduct.id,
        packageId: samplePackage.id,
        validFrom: paidAt,
        validUntil: validUntil,
        downloadLimit: 5,
        downloadCount: 1,
        status: 'ACTIVE'
      }
    });
  }

  // --- Settings ---
  const settingsData = [
    { key: 'site_name', value: 'KTP CAD LIBRARY – Thư viện Bản vẽ Thiết kế Máy & Phụ tùng CAD' },
    { key: 'hotline', value: '0901 234 567' },
    { key: 'company_name', value: 'CÔNG TY TNHH KỸ THUẬT KHANG THỊNH PHÁT (KTP)' },
    { key: 'default_download_limit', value: '5' },
    { key: 'default_license_days', value: '30' },
    { key: 'bank_name', value: 'MB Bank (Ngân hàng Quân Đội)' },
    { key: 'bank_account_no', value: '090123456789' },
    { key: 'bank_account_holder', value: 'CONG TY KTP CAD LIBRARY' }
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    });
  }

  console.log('✅ Phase 2 Seed Completed Successfully!');
}

main()
  .catch(e => {
    console.error('Phase 2 Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
