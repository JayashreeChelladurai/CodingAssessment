import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface QuestionItem {
  title: string;
  description: string;
  opts: [string, string, string, string];
  correctIdx: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string;
}

const sixtyQuestions: QuestionItem[] = [
  // 1. Q1 from PDF
  {
    title: "Three Numbers Ratio & LCM",
    description: "Three numbers are in the ratio of 3 : 4 : 5 and their L.C.M. is 2400. Their H.C.F. is:",
    opts: ["40", "80", "120", "200"],
    correctIdx: 0,
    explanation: "Let the numbers be 3x, 4x, and 5x. Their LCM is 60x = 2400 => x = 40. The HCF of 3x, 4x, 5x is x, which is 40.",
  },
  // 2. Q2 from PDF
  {
    title: "Two Numbers Ratio & HCF",
    description: "The ratio of two numbers is 3 : 4 and their H.C.F. is 4. Their L.C.M. is:",
    opts: ["12", "16", "24", "48"],
    correctIdx: 3,
    explanation: "The numbers are 3 * 4 = 12 and 4 * 4 = 16. LCM(12, 16) = 48.",
  },
  // 3. Q3 from PDF
  {
    title: "LCM and Ratio to Sum",
    description: "The L.C.M. of two numbers is 48. The numbers are in the ratio 2 : 3. Then the sum of the numbers is:",
    opts: ["28", "32", "40", "64"],
    correctIdx: 2,
    explanation: "Let the numbers be 2x and 3x. Their LCM is 6x = 48 => x = 8. The numbers are 16 and 24. Sum = 16 + 24 = 40.",
  },
  // 4. Q4 from PDF
  {
    title: "Fraction of a Fraction",
    description: "If one-third of one-fourth of a number is 15, then three-tenth of that number is:",
    opts: ["35", "36", "45", "54"],
    correctIdx: 3,
    explanation: "(1/3) * (1/4) * N = 15 => N / 12 = 15 => N = 180. Therefore, (3/10) * 180 = 54.",
  },
  // 5. Q5 from PDF
  {
    title: "Consecutive Odd Integers",
    description: "Three times the first of three consecutive odd integers is 3 more than twice the third. The third integer is:",
    opts: ["9", "11", "13", "15"],
    correctIdx: 3,
    explanation: "Let the integers be x, x + 2, x + 4. 3x = 2(x + 4) + 3 => 3x = 2x + 11 => x = 11. The third integer is 11 + 4 = 15.",
  },
  // 6. Q6 from PDF
  {
    title: "Two-Digit Reversal Difference",
    description: "The difference between a two-digit number and the number obtained by interchanging the positions of its digits is 36. What is the difference between the two digits of that number?",
    opts: ["3", "4", "9", "Cannot be determined"],
    correctIdx: 1,
    explanation: "Difference = (10x + y) - (10y + x) = 9(x - y) = 36 => x - y = 4.",
  },
  // 7. Q7 from PDF
  {
    title: "Product of Digits and Reversal",
    description: "A two-digit number is such that the product of the digits is 8. When 18 is added to the number, then the digits are reversed. The number is:",
    opts: ["18", "24", "42", "81"],
    correctIdx: 1,
    explanation: "Let the number be 10x + y. xy = 8. Adding 18 reverses digits: 10x + y + 18 = 10y + x => 9(y - x) = 18 => y - x = 2. With xy = 8 and y - x = 2, we get x = 2, y = 4. The number is 24.",
  },
  // 8. Q10 from PDF
  {
    title: "Divisibility by 9",
    description: "If the number 481 * 673 is completely divisible by 9, then the smallest whole number in place of * will be:",
    opts: ["2", "5", "6", "7"],
    correctIdx: 3,
    explanation: "Sum of digits = 4 + 8 + 1 + * + 6 + 7 + 3 = 29 + *. The nearest multiple of 9 greater than or equal to 29 is 36. Thus, * = 36 - 29 = 7.",
  },
  // 9. Q11 from PDF
  {
    title: "Depreciation Over Years",
    description: "The value of a washing machine depreciates at the rate of 10% every year. If its present value is Rs. 8,748, then what was the price of the washing machine three years ago?",
    opts: ["Rs. 10,000", "Rs. 11,000", "Rs. 12,000", "Rs. 15,000"],
    correctIdx: 2,
    explanation: "P * (1 - 0.10)^3 = 8748 => P * 0.729 = 8748 => P = 8748 / 0.729 = Rs. 12,000.",
  },
  // 10. Q12 from PDF
  {
    title: "Percentage Error in Calculation",
    description: "A student erroneously multiplied a number by 2/5 instead of 5/2. What is the percentage error in the calculation?",
    opts: ["24%", "54%", "74%", "84%"],
    correctIdx: 3,
    explanation: "Error = (5/2 - 2/5) / (5/2) * 100 = (21/10) * (2/5) * 100 = (21/25) * 100 = 84%.",
  },
  // 11. Q15 from PDF
  {
    title: "Salary and Savings Allocation",
    description: "Ram spends 70% of his salary and deposits 15% of his salary in the bank. If he is left with Rs. 1,500, what is his monthly salary?",
    opts: ["Rs. 9,000", "Rs. 9,500", "Rs. 10,000", "Rs. 10,500"],
    correctIdx: 2,
    explanation: "Remaining percentage = 100% - (70% + 15%) = 15%. 15% of salary = Rs. 1,500 => Salary = 1500 / 0.15 = Rs. 10,000.",
  },
  // 12. Q16 from PDF
  {
    title: "Fruit Seller Percentage",
    description: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:",
    opts: ["588 apples", "600 apples", "672 apples", "700 apples"],
    correctIdx: 3,
    explanation: "Remaining apples = 100% - 40% = 60%. 60% of Total = 420 => Total = 420 / 0.60 = 700 apples.",
  },
  // 13. Q20 from PDF
  {
    title: "Successive Percentage Change",
    description: "The price of an article was first decreased by 20% and then increased by 15%. What was the overall percent decrease or increase?",
    opts: ["8% increase", "8% decrease", "2% decrease", "2% increase"],
    correctIdx: 1,
    explanation: "Net factor = (1 - 0.20) * (1 + 0.15) = 0.80 * 1.15 = 0.92 => 1 - 0.92 = 0.08 = 8% decrease.",
  },
  // 14. Q21 from PDF
  {
    title: "Train Speed and Distance",
    description: "A train travelled a certain distance at a uniform speed. Had the speed been 6 km/h more, it would have needed 4 hours less. Had the speed been 6 km/h less, it would have needed 6 hours more. The distance, in km, travelled by the train is:",
    opts: ["620 km", "720 km", "540 km", "840 km"],
    correctIdx: 1,
    explanation: "Using D = s*(s+6)*4/6 = s*(s-6)*6/6 => 4(s+6) = 6(s-6) => 4s + 24 = 6s - 36 => 2s = 60 => s = 30 km/h. Distance D = 30 * 36 * 4 / 6 = 720 km.",
  },
  // 15. Q22 from PDF
  {
    title: "Boat Upstream and Downstream Distance",
    description: "A boat's speed in still water is 22 km/h, while the river is flowing with a speed of 8 km/h. The time taken to cover a certain distance upstream is 4 hours more than the time taken to cover the same distance downstream. Find the distance.",
    opts: ["100 km", "105 km", "110 km", "115 km"],
    correctIdx: 1,
    explanation: "Downstream speed = 22 + 8 = 30 km/h. Upstream speed = 22 - 8 = 14 km/h. D/14 - D/30 = 4 => D * (16 / 420) = 4 => D = 4 * 420 / 16 = 105 km.",
  },
  // 16. Q24 from PDF
  {
    title: "Boat Speed in Still Water",
    description: "A boat goes 20 km upstream and 44 km downstream in 8 hours. In 5 hours, it goes 15 km upstream and 22 km downstream. Determine the speed of the boat in still water.",
    opts: ["5 km/h", "8 km/h", "10 km/h", "12 km/h"],
    correctIdx: 1,
    explanation: "Let 1/u = x and 1/v = y. 20x + 44y = 8 and 15x + 22y = 5 => 30x + 44y = 10. Subtracting gives 10x = 2 => x = 1/5 (upstream = 5 km/h) and y = 1/11 (downstream = 11 km/h). Speed in still water = (5 + 11)/2 = 8 km/h.",
  },
  // 17. Q29 from PDF
  {
    title: "Time and Work: Joint Effort",
    description: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:",
    opts: ["5/7", "8/15", "9/16", "3/10"],
    correctIdx: 1,
    explanation: "A's 1-day work = 1/15, B's 1-day work = 1/20. Together in 1 day = 1/15 + 1/20 = 7/60. In 4 days = 4 * 7/60 = 7/15. Work left = 1 - 7/15 = 8/15.",
  },
  // 18. Q30 from PDF
  {
    title: "Time and Work: Alternating Assistance",
    description: "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?",
    opts: ["5 days", "10 days", "15 days", "20 days"],
    correctIdx: 2,
    explanation: "Day 1 (A) = 1/20. Day 2 (A) = 1/20. Day 3 (A+B+C) = 1/20 + 1/30 + 1/60 = 6/60 = 1/10. Work in 3 days = 1/20 + 1/20 + 1/10 = 1/5. Entire work completes in 5 * 3 = 15 days.",
  },
  // 19. Q33 from PDF
  {
    title: "Compound Ratio of Four Terms",
    description: "A:B is 1:2; B:C is 3:2 and C:D is 1:3. Find A:B:C:D.",
    opts: ["3:6:4:12", "2:3:5:7", "3:5:7:6", "2:1:6:13"],
    correctIdx: 0,
    explanation: "A:B = 1:2 = 3:6. B:C = 3:2 = 6:4. Thus A:B:C = 3:6:4. C:D = 1:3 = 4:12. Thus A:B:C:D = 3:6:4:12.",
  },
  // 20. Q34 from PDF
  {
    title: "Ratio and Sum of Numbers",
    description: "The ratio of two numbers is 11 : 12. If the sum of the numbers is 253, find the difference between the numbers.",
    opts: ["10", "11", "12", "21"],
    correctIdx: 1,
    explanation: "11x + 12x = 23x = 253 => x = 11. Difference = 12x - 11x = x = 11.",
  },
  // 21. Q37 from PDF
  {
    title: "Money Distribution in Ratio",
    description: "A sum of money is to be distributed among A, B, C, D in the proportion of 5 : 2 : 4 : 3. If C gets Rs. 1,000 more than D, what is B's share?",
    opts: ["Rs. 500", "Rs. 1,500", "Rs. 2,000", "None of these"],
    correctIdx: 2,
    explanation: "C's share - D's share = 4x - 3x = x = Rs. 1,000. B's share = 2x = 2 * 1,000 = Rs. 2,000.",
  },
  // 22. Q41 from PDF
  {
    title: "Average Weight with Common Element",
    description: "The average weight of A, B and C is 45 kg. If the average weight of A and B be 40 kg and that of B and C be 43 kg, then the weight of B is:",
    opts: ["30 kg", "31 kg", "32 kg", "33 kg"],
    correctIdx: 1,
    explanation: "A + B + C = 45 * 3 = 135 kg. A + B = 80 kg => C = 135 - 80 = 55 kg. B + C = 86 kg => B = 86 - 55 = 31 kg.",
  },
  // 23. Q42 from PDF
  {
    title: "Correcting Misread Average",
    description: "The average weight of 36 men is 50 kg. It was found later that the figure of 37 kg was misread as 73 kg. What is the correct average?",
    opts: ["40 kg", "45 kg", "49 kg", "50 kg"],
    correctIdx: 2,
    explanation: "Total weight miscalculated by (73 - 37) = +36 kg. Correct average = 50 - (36 / 36) = 50 - 1 = 49 kg.",
  },
  // 24. Q43 from PDF
  {
    title: "Average Age with Teacher Inclusion",
    description: "The average age of 30 students is 9 years. If the teacher is included the average becomes 10 years. What is the age of the teacher?",
    opts: ["30 years", "35 years", "40 years", "45 years"],
    correctIdx: 2,
    explanation: "Total age of 30 students = 270. Total age with teacher (31 people) = 31 * 10 = 310. Teacher's age = 310 - 270 = 40 years.",
  },
  // 25. Q45 from PDF
  {
    title: "Ratio of Ages Past and Present",
    description: "Five years ago, the ages of A and B were 1 : 2. At present the ratio is 3 : 4. Find the present age of A.",
    opts: ["5 years", "6 years", "7.5 years", "8 years"],
    correctIdx: 2,
    explanation: "Let present ages be 3x and 4x. (3x - 5) / (4x - 5) = 1/2 => 6x - 10 = 4x - 5 => 2x = 5 => x = 2.5. A's present age = 3 * 2.5 = 7.5 years.",
  },
  // 26. Q47 from PDF
  {
    title: "Future Ratio of Ages",
    description: "Present ages of Sam and Anand are in the ratio of 5 : 4 respectively. Three years hence, the ratio of their ages will become 11 : 9 respectively. What is Anand's present age in years?",
    opts: ["15 years", "24 years", "30 years", "32 years"],
    correctIdx: 1,
    explanation: "(5x + 3) / (4x + 3) = 11/9 => 45x + 27 = 44x + 33 => x = 6. Anand's present age = 4x = 24 years.",
  },
  // 27. Q54 from PDF
  {
    title: "Father and Son Age Equation",
    description: "A father said to his son, 'I was as old as you are at the present at the time of your birth'. If the father's age is 38 years now, the son's age five years back was:",
    opts: ["12 years", "14 years", "15 years", "20 years"],
    correctIdx: 1,
    explanation: "Father's age at son's birth = 38 - x = x => 2x = 38 => x = 19 years. Five years back, son's age = 19 - 5 = 14 years.",
  },
  // 28. Q51 from PDF
  {
    title: "Compound Interest Semi-Annual Deposits",
    description: "A bank offers 5% compound interest calculated on half-yearly basis. A customer deposits Rs. 1,600 each on 1st January and 1st July of a year. At the end of the year, the amount he would have gained by way of interest is:",
    opts: ["Rs. 80", "Rs. 121", "Rs. 145", "Rs. 189"],
    correctIdx: 1,
    explanation: "Half-yearly rate = 2.5%. Amount = 1600 * (1 + 0.025)^2 + 1600 * (1 + 0.025) = 1681 + 1640 = 3321. Total deposited = 3200. Interest = 3321 - 3200 = Rs. 121.",
  },
  // 29. Q52 from PDF
  {
    title: "Difference Between Simple and Compound Interest",
    description: "The difference between simple and compound interests compounded annually on a certain sum of money for 2 years at 4% per annum is Re. 1. The sum (in Rs.) is:",
    opts: ["Rs. 597", "Rs. 625", "Rs. 720", "Rs. 856"],
    correctIdx: 1,
    explanation: "Difference = P * (R/100)^2 => 1 = P * (4/100)^2 = P * (1/625) => P = Rs. 625.",
  },
  // 30. Q55 from PDF
  {
    title: "Card Probability",
    description: "A card is drawn from a pack of 52 cards. The probability of getting a queen of club or a king of heart is:",
    opts: ["1/26", "2/35", "2/67", "3/65"],
    correctIdx: 0,
    explanation: "Total cards = 52. Queen of club = 1 card, King of heart = 1 card. Total favorable outcomes = 2. Probability = 2/52 = 1/26.",
  },
  // 31. Q56 from PDF
  {
    title: "Committee Selection Combinations",
    description: "From a group of 7 men and 6 women, five persons are to be selected to form a committee so that at least 3 men are there on the committee. In how many ways can it be done?",
    opts: ["756", "748", "789", "800"],
    correctIdx: 0,
    explanation: "Ways = (7C3 * 6C2) + (7C4 * 6C1) + (7C5 * 6C0) = (35 * 15) + (35 * 6) + (21 * 1) = 525 + 210 + 21 = 756 ways.",
  },
  // 32. Q57 from PDF
  {
    title: "Permutations of Letters with Vowels Together",
    description: "In how many different ways can the letters of the word 'LEADING' be arranged in such a way that the vowels always come together?",
    opts: ["625", "720", "840", "960"],
    correctIdx: 1,
    explanation: "Vowels: E, A, I (3 vowels). Consonants: L, D, N, G (4 consonants). Treating vowels as 1 single block yields 5 units, arranged in 5! = 120 ways. The 3 vowels arrange internally in 3! = 6 ways. Total = 120 * 6 = 720.",
  },
  // 33. Q61 from PDF
  {
    title: "Age Multiplier Equation",
    description: "Rajeev's age after 15 years will be 5 times his age 5 years back. What is the present age of Rajeev?",
    opts: ["5 years", "10 years", "15 years", "20 years"],
    correctIdx: 1,
    explanation: "R + 15 = 5(R - 5) => R + 15 = 5R - 25 => 4R = 40 => R = 10 years.",
  },
  // 34. Q63 from PDF
  {
    title: "Age Product and Ratio",
    description: "The ratio of father's age to son's age is 4 : 1. The product of their ages is 196. What will be the ratio of their ages after 5 years?",
    opts: ["5:11", "11:6", "11:4", "11:7"],
    correctIdx: 2,
    explanation: "(4x) * (x) = 196 => 4x^2 = 196 => x^2 = 49 => x = 7. Father = 28, Son = 7. After 5 years: Father = 33, Son = 12. Ratio = 33:12 = 11:4.",
  },
  // 35. Q66 from PDF
  {
    title: "Partnership Profit with Charity",
    description: "A and B invest in a business in the ratio 3 : 2. If 5% of the total profit goes to charity and A's share is Rs. 855, the total profit is:",
    opts: ["Rs. 1,425", "Rs. 1,500", "Rs. 1,537.50", "Rs. 1,576"],
    correctIdx: 1,
    explanation: "Let total profit be P. Remaining after charity = 0.95P. A's share = (3/5) * 0.95P = 0.57P = 855 => P = 855 / 0.57 = Rs. 1,500.",
  },
  // 36. Q67 from PDF
  {
    title: "Partnership Capital and Time",
    description: "A starts business with Rs. 3,500 and after 5 months, B joins with A as his partner. After a year, the profit is divided in the ratio 2 : 3. What is B's contribution in the capital?",
    opts: ["Rs. 7,500", "Rs. 8,000", "Rs. 8,500", "Rs. 9,000"],
    correctIdx: 3,
    explanation: "Ratio of investments = (3500 * 12) / (B * 7) = 42000 / 7B = 6000 / B. Given 6000 / B = 2/3 => 2B = 18000 => B = Rs. 9,000.",
  },
  // 37. Q76 from PDF
  {
    title: "Alligation of Mixtures",
    description: "In what ratio should two varieties of sugar of Rs. 18 per kg and Rs. 24 per kg be mixed together to get a mixture whose cost is Rs. 20 per kg?",
    opts: ["2 : 1", "3 : 1", "4 : 1", "5 : 1"],
    correctIdx: 0,
    explanation: "By rule of alligation: (24 - 20) : (20 - 18) = 4 : 2 = 2 : 1.",
  },
  // 38. Q77 from PDF
  {
    title: "Vessel Spirit and Water Mixture",
    description: "Two vessels A and B contain spirit and water in the ratio 5 : 2 and 7 : 6 respectively. Find the ratio in which this mixture be mixed to obtain a new mixture in the vessel C containing spirit and water in the ratio 8 : 5?",
    opts: ["5 : 7", "6 : 7", "7 : 9", "7 : 3"],
    correctIdx: 2,
    explanation: "Fraction of spirit: A = 5/7, B = 7/13, Mean C = 8/13. Ratio = (8/13 - 7/13) : (5/7 - 8/13) = (1/13) : (9/91) = (7/91) : (9/91) = 7 : 9.",
  },
  // 39. Q79 from PDF
  {
    title: "Dishonest Milkman Gain Percentage",
    description: "A dishonest milkman professes to sell his milk at cost price but he mixes it with water and thereby gains 25%. The percentage of water in the mixture is:",
    opts: ["10%", "20%", "30%", "40%"],
    correctIdx: 1,
    explanation: "Let CP of 1 litre milk be Rs. 1. SP of 1 litre mixture = Rs. 1. Gain = 25% => CP of mixture = 1 / 1.25 = Rs. 0.80. Quantity of milk = 0.80 L, water = 0.20 L. Water percentage = (0.20 / 1.00) * 100 = 20%.",
  },
  // 40. Q80 from PDF
  {
    title: "Mixture Ratio Adjustment",
    description: "In a 729 litre mixture of milk and water, the ratio of milk to water is 7 : 2. To get a new mixture containing milk and water in the ratio 7 : 3, the amount of water to be added is:",
    opts: ["50 L", "65 L", "80 L", "81 L"],
    correctIdx: 3,
    explanation: "Milk = (7/9) * 729 = 567 L. Water = (2/9) * 729 = 162 L. In new ratio 7:3 with 567 L milk, required water = (3/7) * 567 = 243 L. Water to add = 243 - 162 = 81 L.",
  },
  // 41. Q86 from PDF
  {
    title: "Simple Interest Doubling Rate",
    description: "At what rate percent per annum will a sum of money double in 20 years?",
    opts: ["1.2%", "2%", "4%", "5%"],
    correctIdx: 3,
    explanation: "SI = P. Rate R = (SI * 100) / (P * T) = (P * 100) / (P * 20) = 5% per annum.",
  },
  // 42. Q87 from PDF
  {
    title: "Principal from Two Given Amounts",
    description: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
    opts: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
    correctIdx: 2,
    explanation: "SI for 1 year = 854 - 815 = Rs. 39. SI for 3 years = 39 * 3 = Rs. 117. Principal = 815 - 117 = Rs. 698.",
  },
  // 43. Q94 from PDF
  {
    title: "Cost Price from Percentage Loss",
    description: "A shopkeeper sells an article for Rs. 200 with a loss of 20%. Find the cost price of the article.",
    opts: ["Rs. 220", "Rs. 250", "Rs. 280", "Rs. 260"],
    correctIdx: 1,
    explanation: "SP = 0.80 * CP => CP = 200 / 0.80 = Rs. 250.",
  },
  // 44. Q95 from PDF
  {
    title: "Gain Percent on Quantities",
    description: "S.P. of 10 candles is the same as C.P. of 12 candles. Find the gain percent.",
    opts: ["11%", "15%", "20%", "25%"],
    correctIdx: 2,
    explanation: "Gain% = (12 - 10) / 10 * 100 = (2/10) * 100 = 20%.",
  },
  // 45. Q97 from PDF
  {
    title: "Equal Markup and Discount",
    description: "If a retailer marks up his price by 30% and then allows a 30% discount, what is his percentage profit or loss?",
    opts: ["9% gain", "8% gain", "8% loss", "9% loss"],
    correctIdx: 3,
    explanation: "Net change = 30 - 30 - (30 * 30)/100 = -9% => 9% loss.",
  },
  // 46. Q109 from PDF
  {
    title: "Geometric Multiplicative Series",
    description: "Look at this series: 2, 6, 18, 54, ... What number should come next?",
    opts: ["98", "162", "195", "324"],
    correctIdx: 1,
    explanation: "Each number is multiplied by 3: 2 * 3 = 6, 6 * 3 = 18, 18 * 3 = 54, 54 * 3 = 162.",
  },
  // 47. Q114 from PDF
  {
    title: "Alternating Arithmetic Series",
    description: "Look at this series: 22, 21, 23, 22, 24, 23, ... What number should come next?",
    opts: ["20", "25", "30", "45"],
    correctIdx: 1,
    explanation: "The pattern alternates between -1 and +2: 22 - 1 = 21, 21 + 2 = 23, 23 - 1 = 22, 22 + 2 = 24, 24 - 1 = 23, 23 + 2 = 25.",
  },
  // 48. Q255 from PDF
  {
    title: "Doubling Difference Series",
    description: "Find the next number in the series: 3, 8, 18, 38, 78, ?",
    opts: ["148", "156", "158", "160"],
    correctIdx: 2,
    explanation: "Differences are: 5, 10, 20, 40, ... Next difference is 80 => 78 + 80 = 158.",
  },
  // 49. Q116 from PDF
  {
    title: "Direction Sense: Morning Shadow",
    description: "One morning Udai and Vishal were talking to each other face to face at a crossing. If Vishal's shadow was exactly to the left of Udai, which direction was Udai facing?",
    opts: ["East", "West", "North", "South"],
    correctIdx: 2,
    explanation: "In the morning, the sun rises in the East and shadows fall toward the West. Vishal's shadow falls to the West. Since this shadow is to the left of Udai, Udai's left points West, meaning Udai is facing North.",
  },
  // 50. Q119 from PDF
  {
    title: "Direction Displacement: Loop Path",
    description: "From his house, Lokesh went 15 km to the North. Then he turned West and covered 10 km. Then he turned South and covered 5 km. Finally turning to the East, he covered 10 km. In which direction is he from his house?",
    opts: ["East", "West", "North", "South"],
    correctIdx: 2,
    explanation: "East and West movements cancel out (10 km West then 10 km East). Net North-South displacement = 15 km North - 5 km South = 10 km North. He is North of his house.",
  },
  // 51. Q150 from PDF
  {
    title: "Multi-Step Walk Distance & Direction",
    description: "Rasik walked 20 m towards North. Then he turned right and walks 30 m. Then he turns right and walks 35 m. Then he turns left and walks 15 m. Finally he turns left and walks 15 m. In which direction and how many metres is he from the starting position?",
    opts: ["15 m West", "30 m East", "30 m West", "45 m East"],
    correctIdx: 3,
    explanation: "North-South: +20 - 35 + 15 = 0 m. East-West: +30 + 15 = 45 m East. He is 45 m East of the starting position.",
  },
  // 52. Q120 from PDF
  {
    title: "Blood Relation: Photograph Identification",
    description: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    opts: ["Brother", "Father", "Uncle", "Cousin"],
    correctIdx: 1,
    explanation: "The only son of Suresh's mother is Suresh himself. The boy is the son of Suresh, so Suresh is the father.",
  },
  // 53. Q163 from PDF
  {
    title: "Blood Relation: Extended Family",
    description: "M is the son of N. N is the sister of O. O is the father of P. How is M related to P?",
    opts: ["Brother", "Cousin", "Nephew", "Uncle"],
    correctIdx: 1,
    explanation: "N and O are brother and sister. M is N's son and P is O's child. Children of siblings are first cousins.",
  },
  // 54. Q111 from PDF
  {
    title: "Syllogism: Windows, Doors and Walls",
    description: "Statements: All the windows are doors. No door is a wall.\nConclusions:\n(I) Some windows are walls.\n(II) No wall is a door.",
    opts: ["Only I follows", "Only II follows", "None follows", "Both follow"],
    correctIdx: 1,
    explanation: "All windows are doors and no door is a wall => No window is a wall, so (I) is false. Since 'No door is a wall' converts directly to 'No wall is a door', conclusion (II) definitely follows.",
  },
  // 55. Q123 from PDF
  {
    title: "Syllogism: Cups, Books and Shirts",
    description: "Statements: All cups are books. All books are shirts.\nConclusions:\n(I) Some cups are not shirts.\n(II) Some shirts are cups.",
    opts: ["Only I follows", "Only II follows", "None follows", "Both follow"],
    correctIdx: 1,
    explanation: "All cups are books + All books are shirts => All cups are shirts. Therefore, 'Some shirts are cups' follows by conversion, and 'Some cups are not shirts' is false.",
  },
  // 56. Q155 from PDF
  {
    title: "Syllogism: Vehicles and Electric Bicycles",
    description: "Statements: No vehicle is a bicycle. Some bicycles are electric. All electric things require power.\nConclusions:\n(I) Some things requiring power are bicycles.\n(II) No vehicle requires power.",
    opts: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions follow", "Neither conclusion follows"],
    correctIdx: 0,
    explanation: "Since some bicycles are electric and all electric things require power, some bicycles require power => 'Some things requiring power are bicycles' follows. Conclusion II is unsupported.",
  },
  // 57. Q144 from PDF
  {
    title: "Circular Seating Arrangement: 7 Friends",
    description: "P, Q, R, S, T, U and V are seven friends sitting in a circle facing the center. V is second to the left of S and is the neighbor of T and U. S is not a neighbor of R or T. P is a neighbor of Q and R. Which of the following is correct?",
    opts: ["Q is between P and S", "S is between U and P", "T is to the immediate right of V", "U is to the immediate left of V"],
    correctIdx: 0,
    explanation: "Arranging clockwise: S, U, V, T, R, P, Q. In this layout, Q is placed right between P and S.",
  },
  // 58. Q175 from PDF
  {
    title: "Comparing File Sizes",
    description: "Six files A, B, C, D, E and F are arranged by size. A is larger than C but smaller than E. B is smaller than D but larger than F. C is larger than D. Which file is the largest?",
    opts: ["A", "B", "E", "D"],
    correctIdx: 2,
    explanation: "From the given conditions: E > A > C, D > B > F, and C > D. Combining these inequalities gives the unique ranking: E > A > C > D > B > F. Therefore, File E is the largest.",
  },
  // 59. Q158 from PDF
  {
    title: "Alphabetical Position Coding",
    description: "If DELHI is represented by its alphabetical positions as 4-5-12-8-9, how will CHENNAI be represented?",
    opts: ["3-8-5-14-14-1-9", "3-8-5-13-13-1-9", "3-7-5-14-14-1-9", "2-8-5-14-14-1-9"],
    correctIdx: 0,
    explanation: "C = 3, H = 8, E = 5, N = 14, N = 14, A = 1, I = 9 => 3-8-5-14-14-1-9.",
  },
  // 60. Q277 from PDF
  {
    title: "HCF and LCM Product Relation",
    description: "The HCF of two numbers is 18 and their LCM is 1260. If one number is 90, what is the other number?",
    opts: ["216", "252", "270", "280"],
    correctIdx: 1,
    explanation: "Product of two numbers = HCF * LCM => 90 * Other = 18 * 1260 => Other = (18 * 1260) / 90 = 252.",
  },
];

async function seedAptitudeAssessment() {
  console.log("=== Seeding Aptitude Assessment (APT60) with 60 Curated MCQs ===");
  const code = "APT60";
  const title = "Aptitude & Logical Reasoning Assessment (APT60)";
  const description =
    "Official 60-Minute Aptitude & Logical Reasoning Assessment. 60 Questions, +1 mark for correct answers, -1 mark penalty for incorrect answers. Safe Exam Browser mandatory. Same 60 questions presented in shuffled order.";

  // Upsert Assessment
  const existing = await prisma.assessment.findUnique({ where: { code } });

  let assessmentId: string;
  if (existing) {
    console.log(`Found existing assessment with code ${code}. Updating and replacing questions...`);
    await prisma.submission.deleteMany({ where: { question: { assessmentId: existing.id } } });
    await prisma.question.deleteMany({ where: { assessmentId: existing.id } });
    await prisma.section.deleteMany({ where: { assessmentId: existing.id } });

    const updated = await prisma.assessment.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        durationMinutes: 60,
        shuffleQuestions: true,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isReviewUnlocked: false,
      },
    });
    assessmentId = updated.id;
  } else {
    console.log(`Creating new assessment ${code}...`);
    const created = await prisma.assessment.create({
      data: {
        code,
        title,
        description,
        durationMinutes: 60,
        shuffleQuestions: true,
        requireSeb: true,
        sebQuitPassword: "exit123",
        isReviewUnlocked: false,
      },
    });
    assessmentId = created.id;
  }

  // Create Section
  const section = await prisma.section.create({
    data: {
      assessmentId,
      title: "Section A: Quantitative Aptitude & Logical Reasoning",
      description: "60 Multiple Choice Questions. 60 Minutes. +1 mark for correct answer, -1 mark for wrong answer.",
      order: 1,
    },
  });

  console.log(`Inserting ${sixtyQuestions.length} questions for ${code}...`);

  for (let i = 0; i < sixtyQuestions.length; i++) {
    const q = sixtyQuestions[i];
    const optionIds = ["opt-1", "opt-2", "opt-3", "opt-4"];
    const options = q.opts.map((text, idx) => ({
      id: optionIds[idx],
      text: text.trim(),
    }));

    await prisma.question.create({
      data: {
        assessmentId,
        sectionId: section.id,
        type: "MCQ",
        mcqType: "SINGLE",
        title: `Q${i + 1}: ${q.title}`,
        description: q.description,
        marks: 1.0,
        negativeMarks: 1.0,
        order: i,
        options: JSON.stringify(options),
        correctAnswers: JSON.stringify([optionIds[q.correctIdx]]),
        explanation: q.explanation,
      },
    });
  }

  console.log(`✓ Successfully seeded ${sixtyQuestions.length} questions into ${code}!`);
}

seedAptitudeAssessment()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed:", err);
    process.exit(1);
  });
