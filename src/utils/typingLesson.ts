// Một mảng các bài học đơn giản.
// Trong một ứng dụng thực tế, bạn có thể muốn tìm nạp (fetch) chúng từ một API
// hoặc có một thư viện lớn hơn nhiều.

import { getWikiLessons } from "@/lib/wiki";

export const typingLessons = [
  {
    id: 4,
    name: "Home Row 1",
    text: `As Vietnam announced plans to make English a compulsory subject from grade 1, parents across the country rejoiced, seeing it as a chance for their children to get an early start in language learning without the cost of private lessons. When 34-year-old Van Quy heard that English would soon become a compulsory subject from Grade 1, he felt both excited and relieved. His daughter in Hanoi will enter primary school next year, and he has been spending VND2-3 million ($76-114) a month on private English classes so she can gain confidence speaking a foreign language early.`,
  },
  {
    id: 5,
    name: "Home Row 2",
    text: "Converting gasoline-powered motorcycles into electric ones poses safety concerns, experts caution, pointing to risks such as battery fires, frame instability, and inadequate heat resistance.",
  },
  {
    id: 6,
    name: "Home Row 3",
    text: "Typically, it involves removing the gasoline engine and replacing it with an electric motor though sometimes vehicles retain both engines. Though the technical process of replacing the engine is relatively straightforward, experts caution that there are significant safety risks as well as challenges related to legality and operating costs. Such conversions alter the motorcycle's frame and weight distribution originally designed for a gasoline engine, they point out.",
  },
  {
    id: 7,
    name: "Home Row 3",
    text: "Vietnam Airlines has canceled and rescheduled more than 50 flights on Nov. 6-7 as Typhoon Kalmaegi nears Vietnam's central coast, disrupting air travel across multiple central provinces.",
  },
  {
    id: 5,
    name: "Home Row 3",
    text: "The airline said routes between Ho Chi Minh City's Tan Son Nhat Airport and Phu Cat in Gia Lai Province will be suspended, including flights VN1390, VN1391, VN1394 and VN1395 on Nov. 6, and VN1392 and VN1393 on Nov. 7. Two Hanoi-Phu Cat flights, VN1622 and VN1623, will depart earlier than planned, before noon on Nov. 6",
  },

  {
    id: 5,
    name: "Home Row 3",
    text: "Vietnam Airlines has also rescheduled flights VN1422 and VN1423 between Tan Son Nhat and Pleiku (Gia Lai) to before noon on Nov. 6, while the Hanoi-Pleiku flights VN1614 and VN1615 will take off after 1 p.m. on Nov. 7",
  },

  {
    id: 5,
    name: "Home Row 3",
    text: "Four flights between Tan Son Nhat, Da Nang and Buon Ma Thuot (Dak Lak) on Nov. 6 will operate after 11 a.m., while two Hanoi-Buon Ma Thuot flights on Nov. 7 will depart after 1 p.m. Similarly, four flights connecting Hanoi, Ho Chi Minh City and Hue on Nov. 6 will fly after noon, and two Ho Chi Minh City-Hue flights on Nov. 7 will leave after 1 p.m.",
  },
];

// Hàm helper để lấy một bài học ngẫu nhiên
export const getRandomLesson = (typingLessons: WikiLesson[]) => {
  console.log(typingLessons);

  const randomIndex = Math.floor(Math.random() * typingLessons.length);
  if (!typingLessons[randomIndex]?.text) return "";
  return typingLessons[randomIndex].text;
};

export interface WikiLesson {
  id: number;
  name: string;
  text: string;
}
export const getRandomLessonFromWiki = async () => {
  const lessons = await getWikiLessons("Science");
  console.log({ lessons });

  const randomIndex = Math.floor(Math.random() * lessons.length);
  return lessons[randomIndex]!.text;
};
