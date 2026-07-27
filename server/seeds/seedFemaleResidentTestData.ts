import { memberService } from "../services/memberService";
import { createResidentUserForResident, getUserByUsername } from "../db/user";

const residents = [
      ["Anna", "Trần Thị Mai Anh", "Buôn Hồ, Đắk Lắk", "0909100102", "Trần Thị Lan"],
      ["Maria", "Nguyễn Thị Thu Hà", "Cư M'gar, Đắk Lắk", "0909100103", "Nguyễn Thị Hương"],
      ["Têrêsa", "Lê Thị Ngọc Hân", "Krông Pắc, Đắk Lắk", "0909100104", "Lê Thị Hoa"],
      ["Cecilia", "Phạm Thị Khánh Linh", "Ea Kar, Đắk Lắk", "0909100105", "Phạm Thị Thủy"],
      ["Lucia", "Hoàng Thị Minh Châu", "Krông Ana, Đắk Lắk", "0909100106", "Hoàng Thị Hiền"],
      ["Monica", "Vũ Thị Bảo Ngọc", "Ea H'leo, Đắk Lắk", "0909100107", "Vũ Thị Nga"],
      ["Agnes", "Đỗ Thị Thanh Trúc", "Lắk, Đắk Lắk", "0909100108", "Đỗ Thị Hạnh"],
      ["Rosa", "Bùi Thị Quỳnh Như", "M'Đrắk, Đắk Lắk", "0909100109", "Bùi Thị Hà"],
      ["Clara", "Đặng Thị Phương Thảo", "Krông Bông, Đắk Lắk", "0909100110", "Đặng Thị Mai"],
      ["Elisabeth", "Hồ Thị Yến Nhi", "Cư Kuin, Đắk Lắk", "0909100111", "Hồ Thị Tuyết"],
      ["Marta", "Phan Thị Kim Oanh", "Ea Súp, Đắk Lắk", "0909100112", "Phan Thị Lệ"],
      ["Magdalena", "Võ Thị Thùy Dương", "Buôn Đôn, Đắk Lắk", "0909100113", "Võ Thị Hồng"],
      ["Giusepha", "Ngô Thị Mỹ Duyên", "Đắk Mil, Đắk Nông", "0909100114", "Ngô Thị Vân"],
      ["Veronica", "Dương Thị Hải Yến", "Gia Nghĩa, Đắk Nông", "0909100115", "Dương Thị Ánh"],
      ["Dominica", "Lý Thị Thanh Tâm", "Pleiku, Gia Lai", "0909100116", "Lý Thị Thúy"],
      ["Faustina", "Mai Thị Như Ý", "Ayun Pa, Gia Lai", "0909100117", "Mai Thị Liên"],
      ["Helena", "Trịnh Thị Ngọc Diệp", "Đức Trọng, Lâm Đồng", "0909100118", "Trịnh Thị Loan"],
      ["Catarina", "Tạ Thị Hoài Thương", "Bảo Lộc, Lâm Đồng", "0909100119", "Tạ Thị Thanh"],
] as const;

async function main() {
      const admin = await getUserByUsername("admin");
      if (!admin) {
            throw new Error("Không tìm thấy tài khoản admin.");
      }

      const existing = await memberService.listMembers({ limit: 500 });
      const existingPhones = new Set(
            existing.map((resident: any) => resident.phoneNumber).filter(Boolean)
      );

      const created: Array<{
            residentId: number;
            name: string;
            username: string;
      }> = [];
      const skipped: string[] = [];

      for (let index = 0; index < residents.length; index += 1) {
            const [holyName, fullName, address, phoneNumber, motherName] =
                  residents[index];

            if (existingPhones.has(phoneNumber)) {
                  skipped.push(fullName);
                  continue;
            }

            const member = await memberService.createMember({
                  holyName,
                  fullName,
                  dateOfBirth: new Date(2004 + (index % 5), index % 12, 2 + index),
                  gender: "female",
                  idNumber: `066${String(204000100 + index).padStart(9, "0")}`,
                  permanentAddress: address,
                  phoneNumber,
                  admissionDate: new Date(2026, 6, 27),
                  notes: "Dữ liệu nền UAT - nữ học sinh/sinh viên học tại Buôn Ma Thuột",
                  parents: [
                        {
                              parentType: "mother",
                              fullName: motherName,
                              phoneNumber: `0919200${String(102 + index).padStart(3, "0")}`,
                              occupation: "Phụ huynh",
                              address,
                              notes: "Liên hệ gia đình chính - dữ liệu UAT",
                        },
                  ],
            });

            const residentId = Number((member as any)?.id);
            if (!residentId) {
                  throw new Error(`Không xác định được ID của ${fullName}.`);
            }

            const account = await createResidentUserForResident({
                  residentId,
                  temporaryPassword: "123456",
                  mustChangePassword: true,
                  assignedBy: admin.id,
            });

            created.push({
                  residentId,
                  name: fullName,
                  username: account.username,
            });

            // generateResidentCode uses the current millisecond suffix.
            await new Promise((resolve) => setTimeout(resolve, 5));
      }

      console.log(
            JSON.stringify(
                  {
                        requested: residents.length,
                        created: created.length,
                        skipped: skipped.length,
                        accounts: created,
                  },
                  null,
                  2
            )
      );
}

main()
      .then(() => process.exit(0))
      .catch((error) => {
            console.error(error);
            process.exit(1);
      });
