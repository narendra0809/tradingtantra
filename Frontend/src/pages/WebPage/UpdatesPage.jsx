import CustomHeroImage from "../../Components/CustomHeroImage";
import { updates } from "../../constants/constants";

const UpdatesPage = () => {
  return (
    <>
      <CustomHeroImage title="Updates" />
      <div className="w-full h-auto p-6 md:p-10 border-2 border-[#0256F5] rounded-lg">
        {updates.map((item, index) => (
          <div
            key={index}
            className="py-5 flex flex-col md:flex-row items-start md:items-center justify-start gap-4 md:gap-8 border-b border-b-[#013AA6] w-full"
          >
            <p className="text-base w-32 md:w-40">{item.date}</p>
            <div
              className="w-24 h-10 flex items-center justify-center rounded-lg text-xs font-semibold"
              style={{
                backgroundColor:
                  item.type === "Release"
                    ? "#6E9FFE"
                    : item.type === "Improvement"
                    ? "#151B2D"
                    : "var(--color-primary)",
              }}
            >
              <p
                className={
                  item.type === "Improvement" ? "text-white" : "text-white"
                }
              >
                {item.type}
              </p>
            </div>
            <p className="text-sm text-[#FFFFFF80] text-wrap md:flex-1">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default UpdatesPage;
