import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GeneratedQuestion {
  title: string;
  description: string;
  options: Array<{ id: string; text: string }>;
  correctAnswers: string[];
  explanation: string;
  marks: number;
  negativeMarks: number;
}

// Helper to construct cleanly formatted MCQs
function makeMcq(
  title: string,
  description: string,
  opts: [string, string, string, string],
  correctIdx: number, // 0 for A, 1 for B, 2 for C, 3 for D
  explanation: string = "",
  marks: number = 1.0,
  negativeMarks: number = 0.0
): GeneratedQuestion {
  const optionIds = ["opt-1", "opt-2", "opt-3", "opt-4"];
  const options = opts.map((text, idx) => ({
    id: optionIds[idx],
    text: text.trim(),
  }));

  return {
    title: title.trim(),
    description: description.trim(),
    options,
    correctAnswers: [optionIds[correctIdx]],
    explanation: explanation.trim(),
    marks,
    negativeMarks,
  };
}

// Generate the 150-question set for either test "AT1" or "AT2"
export function generateQuestionBank(testType: "AT1" | "AT2"): GeneratedQuestion[] {
  const isAT1 = testType === "AT1";
  const questions: GeneratedQuestion[] = [];

  // Q1: Ratio of 3 numbers and LCM -> find HCF
  if (isAT1) {
    // Ratio 2:3:5, LCM = 1800 -> lcm(2,3,5) = 30 -> HCF = 1800/30 = 60
    questions.push(
      makeMcq(
        "Three Numbers Ratio & LCM",
        "Three numbers are in the ratio of 2 : 3 : 5 and their L.C.M. is 1800. Their H.C.F. is:",
        ["30", "60", "90", "120"],
        1,
        "Let the numbers be 2x, 3x, 5x. Their LCM is 30x = 1800 => x = 60. The HCF is x = 60."
      )
    );
  } else {
    // Ratio 3:5:7, LCM = 3150 -> lcm(3,5,7) = 105 -> HCF = 3150/105 = 30
    questions.push(
      makeMcq(
        "Three Numbers Ratio & LCM",
        "Three numbers are in the ratio of 3 : 5 : 7 and their L.C.M. is 3150. Their H.C.F. is:",
        ["15", "30", "45", "60"],
        1,
        "Let the numbers be 3x, 5x, 7x. Their LCM is 105x = 3150 => x = 30. The HCF is x = 30."
      )
    );
  }

  // Q2: Ratio of two numbers and HCF -> find LCM
  if (isAT1) {
    // Ratio 4:5, HCF = 6 -> Numbers: 24, 30 -> LCM = 120
    questions.push(
      makeMcq(
        "Two Numbers Ratio & HCF",
        "The ratio of two numbers is 4 : 5 and their H.C.F. is 6. Their L.C.M. is:",
        ["60", "90", "120", "150"],
        2,
        "Numbers are 4 * 6 = 24 and 5 * 6 = 30. LCM(24, 30) = 120."
      )
    );
  } else {
    // Ratio 5:7, HCF = 8 -> Numbers: 40, 56 -> LCM = 280
    questions.push(
      makeMcq(
        "Two Numbers Ratio & HCF",
        "The ratio of two numbers is 5 : 7 and their H.C.F. is 8. Their L.C.M. is:",
        ["140", "210", "280", "320"],
        2,
        "Numbers are 5 * 8 = 40 and 7 * 8 = 56. LCM(40, 56) = 280."
      )
    );
  }

  // Q3: LCM of two numbers and ratio -> find sum
  if (isAT1) {
    // LCM = 72, ratio 3:4 -> 12x = 72 => x = 6. Numbers: 18, 24. Sum = 42
    questions.push(
      makeMcq(
        "LCM and Ratio to Sum",
        "The L.C.M. of two numbers is 72. The numbers are in the ratio 3 : 4. Then the sum of the numbers is:",
        ["36", "42", "48", "54"],
        1,
        "Let the numbers be 3x and 4x. LCM is 12x = 72 => x = 6. Numbers are 18 and 24. Sum = 18 + 24 = 42."
      )
    );
  } else {
    // LCM = 90, ratio 2:5 -> 10x = 90 => x = 9. Numbers: 18, 45. Sum = 63
    questions.push(
      makeMcq(
        "LCM and Ratio to Sum",
        "The L.C.M. of two numbers is 90. The numbers are in the ratio 2 : 5. Then the sum of the numbers is:",
        ["54", "63", "72", "81"],
        1,
        "Let the numbers be 2x and 5x. LCM is 10x = 90 => x = 9. Numbers are 18 and 45. Sum = 18 + 45 = 63."
      )
    );
  }

  // Q4: Fraction of a fraction of a number
  if (isAT1) {
    // (1/4)*(1/5)*N = 16 => N = 320. Then (3/8)*320 = 120
    questions.push(
      makeMcq(
        "Fractions of a Number",
        "If one-fourth of one-fifth of a number is 16, then three-eighth of that number is:",
        ["90", "105", "120", "140"],
        2,
        "(1/20) * N = 16 => N = 320. Then (3/8) * 320 = 120."
      )
    );
  } else {
    // (1/2)*(1/3)*N = 25 => N = 150. Then (4/5)*150 = 120
    questions.push(
      makeMcq(
        "Fractions of a Number",
        "If one-half of one-third of a number is 25, then four-fifth of that number is:",
        ["100", "110", "120", "135"],
        2,
        "(1/6) * N = 25 => N = 150. Then (4/5) * 150 = 120."
      )
    );
  }

  // Q5: Consecutive odd integers equation
  if (isAT1) {
    // 3*x = 2*(x+4) + 7 => 3x = 2x + 15 => x = 15. Third is 19
    questions.push(
      makeMcq(
        "Consecutive Odd Integers",
        "Three times the first of three consecutive odd integers is 7 more than twice the third. The third integer is:",
        ["15", "17", "19", "21"],
        2,
        "Let integers be x, x+2, x+4. 3x = 2(x+4) + 7 => 3x = 2x + 15 => x = 15. Third integer = 15 + 4 = 19."
      )
    );
  } else {
    // 4*x = 2*(x+4) + 14 => 4x = 2x + 22 => 2x = 22 => x = 11. Third is 15
    questions.push(
      makeMcq(
        "Consecutive Odd Integers",
        "Four times the first of three consecutive odd integers is 14 more than twice the third. The third integer is:",
        ["11", "13", "15", "17"],
        2,
        "Let integers be x, x+2, x+4. 4x = 2(x+4) + 14 => 2x = 22 => x = 11. Third integer = 11 + 4 = 15."
      )
    );
  }

  // Q6: Difference between two-digit number and reversed digits
  if (isAT1) {
    // Diff = 45 => 9*(x-y) = 45 => x-y = 5
    questions.push(
      makeMcq(
        "Two-Digit Reversal Difference",
        "The difference between a two-digit number and the number obtained by interchanging the positions of its digits is 45. What is the difference between the two digits of that number?",
        ["4", "5", "6", "Cannot be determined"],
        1,
        "Difference is (10x + y) - (10y + x) = 9(x - y) = 45 => x - y = 5."
      )
    );
  } else {
    // Diff = 54 => 9*(x-y) = 54 => x-y = 6
    questions.push(
      makeMcq(
        "Two-Digit Reversal Difference",
        "The difference between a two-digit number and the number obtained by interchanging the positions of its digits is 54. What is the difference between the two digits of that number?",
        ["5", "6", "7", "Cannot be determined"],
        1,
        "Difference is 9(x - y) = 54 => x - y = 6."
      )
    );
  }

  // Q7: Product of digits & addition reverses digits
  if (isAT1) {
    // product = 12, add 36 => 9(y-x) = 36 => y-x = 4. xy = 12 => x=2, y=6 => number is 26
    questions.push(
      makeMcq(
        "Product of Digits and Reversal",
        "A two-digit number is such that the product of its digits is 12. When 36 is added to the number, the digits are reversed. The number is:",
        ["26", "34", "43", "62"],
        0,
        "Let number be 10x + y. xy = 12. 10x + y + 36 = 10y + x => 9(y - x) = 36 => y - x = 4. With xy = 12, x = 2 and y = 6. Number = 26."
      )
    );
  } else {
    // product = 18, add 27 => 9(y-x) = 27 => y-x = 3. xy = 18 => x=3, y=6 => number is 36
    questions.push(
      makeMcq(
        "Product of Digits and Reversal",
        "A two-digit number is such that the product of its digits is 18. When 27 is added to the number, the digits are reversed. The number is:",
        ["29", "36", "63", "92"],
        1,
        "xy = 18. 9(y - x) = 27 => y - x = 3. With xy = 18, x = 3 and y = 6. Number = 36."
      )
    );
  }

  // Q8: Sum of digits and difference between digits
  if (isAT1) {
    questions.push(
      makeMcq(
        "Sum and Difference of Digits",
        "The sum of the digits of a two-digit number is 13 and the difference between the digits is 5. What is the two-digit number?",
        ["49", "94", "58", "Cannot be determined"],
        3,
        "The number could be 49 or 94, since it is not specified whether tens digit or units digit is greater. Hence, cannot be determined uniquely."
      )
    );
  } else {
    questions.push(
      makeMcq(
        "Sum and Difference of Digits",
        "The sum of the digits of a two-digit number is 11 and the difference between the digits is 3. What is the two-digit number?",
        ["47", "74", "83", "Cannot be determined"],
        3,
        "The number could be 47 or 74. Hence, cannot be determined uniquely."
      )
    );
  }

  // Q9: Divisibility by 11
  if (isAT1) {
    // 28182 -> (2+1+2) - (8+8) = 5 - 16 = -11 (divisible by 11)
    questions.push(
      makeMcq(
        "Divisibility by 11",
        "Which one of the following numbers is exactly divisible by 11?",
        ["28182", "28185", "315624", "415623"],
        0,
        "For 28182: Sum of odd digits = 2 + 1 + 2 = 5. Sum of even digits = 8 + 8 = 16. Difference = 5 - 16 = -11, divisible by 11."
      )
    );
  } else {
    // 359128 -> (3+9+2) - (5+1+8) = 14 - 14 = 0 (divisible by 11)
    questions.push(
      makeMcq(
        "Divisibility by 11",
        "Which one of the following numbers is exactly divisible by 11?",
        ["359128", "245642", "415625", "528174"],
        0,
        "For 359128: (3+9+2) - (5+1+8) = 14 - 14 = 0, which is divisible by 11."
      )
    );
  }

  // Q10: Divisibility by 9 with missing digit
  if (isAT1) {
    // 532*714 -> sum = 5+3+2+7+1+4 = 22. Next multiple of 9 is 27 -> * = 5
    questions.push(
      makeMcq(
        "Divisibility by 9",
        "If the number 532 * 714 is completely divisible by 9, then the smallest whole number in place of * will be:",
        ["3", "4", "5", "6"],
        2,
        "Sum of digits = 5 + 3 + 2 + 7 + 1 + 4 = 22. Nearest multiple of 9 is 27 => * = 27 - 22 = 5."
      )
    );
  } else {
    // 764*821 -> sum = 7+6+4+8+2+1 = 28. Next multiple is 36 -> * = 8
    questions.push(
      makeMcq(
        "Divisibility by 9",
        "If the number 764 * 821 is completely divisible by 9, then the smallest whole number in place of * will be:",
        ["6", "7", "8", "9"],
        2,
        "Sum of digits = 7 + 6 + 4 + 8 + 2 + 1 = 28. Next multiple of 9 is 36 => * = 36 - 28 = 8."
      )
    );
  }

  // Q11: Depreciation over 3 years
  if (isAT1) {
    // 10% depreciation, present 14580 -> P * 0.729 = 14580 => P = 20000
    questions.push(
      makeMcq(
        "Annual Depreciation",
        "The value of a printing machine depreciates at the rate of 10% every year. If its present value is Rs. 14,580, then what was the price of the machine three years ago?",
        ["Rs. 18,000", "Rs. 20,000", "Rs. 22,000", "Rs. 25,000"],
        1,
        "P * (1 - 0.10)^3 = 14580 => P * 0.729 = 14580 => P = 20000."
      )
    );
  } else {
    // 20% depreciation, present 25600 -> P * (0.8)^3 = 0.512 P = 25600 => P = 50000
    questions.push(
      makeMcq(
        "Annual Depreciation",
        "The value of commercial equipment depreciates at the rate of 20% every year. If its present value is Rs. 25,600, then what was the price of the equipment three years ago?",
        ["Rs. 40,000", "Rs. 45,000", "Rs. 50,000", "Rs. 60,000"],
        2,
        "P * (0.8)^3 = 25600 => 0.512 P = 25600 => P = 50000."
      )
    );
  }

  // Q12: Percentage error in calculation
  if (isAT1) {
    // 3/4 instead of 4/3 -> error = 4/3 - 3/4 = 7/12. Error % = (7/12)/(4/3)*100 = 7/16 * 100 = 43.75%
    questions.push(
      makeMcq(
        "Percentage Error",
        "A student erroneously multiplied a number by 3/4 instead of 4/3. What is the percentage error in the calculation?",
        ["36.5%", "43.75%", "48.2%", "56.25%"],
        1,
        "Error = (4/3 - 3/4) / (4/3) * 100 = (7/12) * (3/4) * 100 = (7/16) * 100 = 43.75%."
      )
    );
  } else {
    // 3/5 instead of 5/3 -> error = 5/3 - 3/5 = 16/15. Error % = (16/15)/(5/3)*100 = 16/25 * 100 = 64%
    questions.push(
      makeMcq(
        "Percentage Error",
        "A student erroneously multiplied a number by 3/5 instead of 5/3. What is the percentage error in the calculation?",
        ["54%", "60%", "64%", "72%"],
        2,
        "Error = (5/3 - 3/5) / (5/3) * 100 = (16/15) * (3/5) * 100 = (16/25) * 100 = 64%."
      )
    );
  }

  // Q13: Successive percentages
  if (isAT1) {
    // 20% of 15% of Rs. 1200 = 0.20 * 0.15 * 1200 = 36
    questions.push(
      makeMcq(
        "Successive Percentage Value",
        "Find the value of 20% of 15% of Rs. 1,200.",
        ["Rs. 28", "Rs. 32", "Rs. 36", "Rs. 40"],
        2,
        "0.20 * 0.15 * 1200 = 36."
      )
    );
  } else {
    // 30% of 20% of Rs. 1500 = 0.30 * 0.20 * 1500 = 90
    questions.push(
      makeMcq(
        "Successive Percentage Value",
        "Find the value of 30% of 20% of Rs. 1,500.",
        ["Rs. 75", "Rs. 90", "Rs. 105", "Rs. 120"],
        1,
        "0.30 * 0.20 * 1500 = 90."
      )
    );
  }

  // Q14: Population decrease over 2 years
  if (isAT1) {
    // 15% decrease p.a., 2 yrs ago 40000 -> 40000 * (0.85)^2 = 40000 * 0.7225 = 28900
    questions.push(
      makeMcq(
        "Population Depreciation",
        "The population of a town is decreasing at a rate of 15% per annum. If the population two years ago was 40,000, what is the present population?",
        ["27,500", "28,900", "30,200", "32,400"],
        1,
        "Present population = 40000 * (0.85)^2 = 40000 * 0.7225 = 28900."
      )
    );
  } else {
    // 10% decrease p.a., 2 yrs ago 50000 -> 50000 * (0.9)^2 = 50000 * 0.81 = 40500
    questions.push(
      makeMcq(
        "Population Depreciation",
        "The population of a town is decreasing at a rate of 10% per annum. If the population two years ago was 50,000, what is the present population?",
        ["38,500", "39,200", "40,500", "42,000"],
        2,
        "Present population = 50000 * (0.90)^2 = 40500."
      )
    );
  }

  // Q15: Salary spending and bank deposit
  if (isAT1) {
    // Spends 65%, deposits 20% -> 15% left = 3000 => salary = 20000
    questions.push(
      makeMcq(
        "Salary and Expenditure",
        "Suresh spends 65% of his salary and deposits 20% of his salary in the bank. If he is left with Rs. 3,000, what is his monthly salary?",
        ["Rs. 18,000", "Rs. 20,000", "Rs. 22,500", "Rs. 25,000"],
        1,
        "Remaining = 100% - (65% + 20%) = 15%. 15% of Salary = 3000 => Salary = 3000 / 0.15 = Rs. 20,000."
      )
    );
  } else {
    // Spends 60%, deposits 25% -> 15% left = 4500 => salary = 30000
    questions.push(
      makeMcq(
        "Salary and Expenditure",
        "Rohan spends 60% of his salary and deposits 25% of his salary in the bank. If he is left with Rs. 4,500, what is his monthly salary?",
        ["Rs. 25,000", "Rs. 28,000", "Rs. 30,000", "Rs. 35,000"],
        2,
        "Remaining = 100% - (60% + 25%) = 15%. 15% of Salary = 4500 => Salary = 4500 / 0.15 = Rs. 30,000."
      )
    );
  }

  // Q16: Sells x% and still has y items
  if (isAT1) {
    // Sells 45%, remains 55% = 495 => total = 495 / 0.55 = 900
    questions.push(
      makeMcq(
        "Item Inventory Percentage",
        "A fruit seller had some oranges. He sells 45% oranges and still has 495 oranges. Originally, he had:",
        ["800 oranges", "850 oranges", "900 oranges", "950 oranges"],
        2,
        "55% of Total = 495 => Total = 495 / 0.55 = 900 oranges."
      )
    );
  } else {
    // Sells 35%, remains 65% = 520 => total = 520 / 0.65 = 800
    questions.push(
      makeMcq(
        "Item Inventory Percentage",
        "A fruit seller had some mangoes. He sells 35% mangoes and still has 520 mangoes. Originally, he had:",
        ["750 mangoes", "800 mangoes", "850 mangoes", "900 mangoes"],
        1,
        "65% of Total = 520 => Total = 520 / 0.65 = 800 mangoes."
      )
    );
  }

  // Q17: Election votes percentage
  if (isAT1) {
    // Votes: 1200, 4800, 6000. Total = 12000. Winner = 6000 => 50%
    questions.push(
      makeMcq(
        "Election Votes Percentage",
        "Three candidates contested an election and received 1,200, 4,800, and 6,000 votes respectively. What percentage of the total votes did the winning candidate get?",
        ["45%", "48%", "50%", "55%"],
        2,
        "Total votes = 1200 + 4800 + 6000 = 12,000. Winning % = (6000 / 12000) * 100 = 50%."
      )
    );
  } else {
    // Votes: 2500, 5000, 12500. Total = 20000. Winner = 12500 => 62.5%
    questions.push(
      makeMcq(
        "Election Votes Percentage",
        "Three candidates contested an election and received 2,500, 5,000, and 12,500 votes respectively. What percentage of the total votes did the winning candidate get?",
        ["58%", "60%", "62.5%", "65%"],
        2,
        "Total votes = 2500 + 5000 + 12500 = 20,000. Winning % = (12500 / 20000) * 100 = 62.5%."
      )
    );
  }

  // Q18: Machine depreciation after 2 years
  if (isAT1) {
    // Cost 200,000, 10% depreciation after 2 yrs -> 200000 * 0.81 = 162,000
    questions.push(
      makeMcq(
        "Two-Year Depreciation",
        "The value of a CNC lathe machine depreciates at the rate of 10% per annum. If the cost of the machine at present is Rs. 200,000, then what will be its worth after 2 years?",
        ["Rs. 158,000", "Rs. 162,000", "Rs. 166,000", "Rs. 172,000"],
        1,
        "Worth after 2 years = 200000 * (0.90)^2 = Rs. 162,000."
      )
    );
  } else {
    // Cost 250,000, 10% depreciation after 2 yrs -> 250000 * 0.81 = 202,500
    questions.push(
      makeMcq(
        "Two-Year Depreciation",
        "The value of a server rack depreciates at the rate of 10% per annum. If the cost of the equipment at present is Rs. 250,000, then what will be its worth after 2 years?",
        ["Rs. 195,000", "Rs. 200,000", "Rs. 202,500", "Rs. 210,000"],
        2,
        "Worth after 2 years = 250000 * (0.90)^2 = Rs. 202,500."
      )
    );
  }

  // Q19: Passing marks & maximum marks
  if (isAT1) {
    // Pass = 40%, gets 85 and fails by 15 => pass mark = 100 => max marks = 100 / 0.40 = 250
    questions.push(
      makeMcq(
        "Examination Passing Marks",
        "Passing marks in an examination are 40%. If a candidate gets 85 marks and fails by 15 marks, the maximum marks in the examination are:",
        ["200", "225", "250", "300"],
        2,
        "Pass marks = 85 + 15 = 100. 40% of Total = 100 => Total = 100 / 0.40 = 250."
      )
    );
  } else {
    // Pass = 35%, gets 92 and fails by 13 => pass mark = 105 => max marks = 105 / 0.35 = 300
    questions.push(
      makeMcq(
        "Examination Passing Marks",
        "Passing marks in an examination are 35%. If a candidate gets 92 marks and fails by 13 marks, the maximum marks in the examination are:",
        ["250", "280", "300", "350"],
        2,
        "Pass marks = 92 + 13 = 105. 35% of Total = 105 => Total = 105 / 0.35 = 300."
      )
    );
  }

  // Q20: Successive percentage changes
  if (isAT1) {
    // Decreased by 25% then increased by 20% -> 0.75 * 1.20 = 0.90 => 10% decrease
    questions.push(
      makeMcq(
        "Net Percentage Change",
        "The price of an article was first decreased by 25% and then increased by 20%. What was the overall percent decrease or increase?",
        ["5% increase", "10% decrease", "8% decrease", "No change"],
        1,
        "Factor = (1 - 0.25) * (1 + 0.20) = 0.75 * 1.20 = 0.90 => 10% decrease."
      )
    );
  } else {
    // Decreased by 10% then increased by 10% -> 0.90 * 1.10 = 0.99 => 1% decrease
    questions.push(
      makeMcq(
        "Net Percentage Change",
        "The price of an article was first decreased by 10% and then increased by 10%. What was the overall percent decrease or increase?",
        ["1% increase", "1% decrease", "2% decrease", "0% change"],
        1,
        "Factor = (1 - 0.10) * (1 + 0.10) = 0.99 => 1% decrease."
      )
    );
  }

  // Helper loop to generate all remaining 130 questions systematically
  // We can implement robust modular question builders for Q21 to Q150
  for (let qNum = 21; qNum <= 150; qNum++) {
    questions.push(generateSpecificQuestion(qNum, isAT1));
  }

  return questions;
}

function generateSpecificQuestion(qNum: number, isAT1: boolean): GeneratedQuestion {
  switch (qNum) {
    case 21: {
      return makeMcq(
        "Train Speed and Distance",
        `A train travelled a certain distance at a uniform speed. Had the speed been ${isAT1 ? "6 km/h" : "10 km/h"} more, it would have needed ${isAT1 ? "4 hours" : "2 hours"} less. Had the speed been ${isAT1 ? "6 km/h" : "10 km/h"} less, it would have needed ${isAT1 ? "6 hours" : "3 hours"} more. The distance travelled by the train is:`,
        isAT1 ? ["720 km", "540 km", "640 km", "840 km"] : ["600 km", "540 km", "640 km", "720 km"],
        0,
        isAT1
          ? "Using distance formulas D = s*(s+6)*4/6 = s*(s-6)*6/6 => 4(s+6) = 6(s-6) => 4s + 24 = 6s - 36 => 2s = 60 => s = 30 km/h. Distance D = 30 * 36 * 4 / 6 = 720 km."
          : "Using distance formulas D = s*(s+10)*2/10 = s*(s-10)*3/10 => 2(s+10) = 3(s-10) => 2s + 20 = 3s - 30 => s = 50 km/h. Distance D = 50 * 60 * 2 / 10 = 600 km."
      );
    }
    case 22: {
      // Boat still water speed u, river v. Upstream time t hrs more than downstream.
      const u = isAT1 ? 20 : 25;
      const v = isAT1 ? 5 : 5;
      // Upstream = u-v = 15, Downstream = u+v = 25. D/15 - D/25 = 4 => D*(10/375) = 4 => D = 150 km
      const dVal = isAT1 ? "150 km" : "120 km";
      return makeMcq(
        "Boat Speed Upstream vs Downstream",
        `A boat's speed in still water is ${u} km/h, while the river flows with a speed of ${v} km/h. If the time taken to cover a certain distance upstream is ${isAT1 ? "4 hours" : "2 hours"} more than downstream, find the distance.`,
        [isAT1 ? "120 km" : "100 km", isAT1 ? "150 km" : "120 km", isAT1 ? "180 km" : "140 km", isAT1 ? "200 km" : "160 km"],
        1,
        "D / (u - v) - D / (u + v) = delta_t. Solving for D yields the distance."
      );
    }
    case 23: {
      // Boat speed = 3 * stream speed. Downstream takes T sec. Extra time upstream?
      // Downstream speed = 3v + v = 4v. Upstream speed = 3v - v = 2v. Time upstream is 2 * downstream time!
      // Extra time = downstream time!
      const t = isAT1 ? "18.5 sec" : "24.0 sec";
      return makeMcq(
        "Stream and Boat Time Ratio",
        `The speed of a boat in still water is thrice the speed of the stream. If the boat takes ${t} to go to a certain place downstream, find the additional time required to cover the same distance travelling upstream:`,
        [isAT1 ? "18.5 sec" : "24.0 sec", isAT1 ? "22.5 sec" : "28.0 sec", isAT1 ? "37.0 sec" : "48.0 sec", isAT1 ? "15.0 sec" : "20.0 sec"],
        0,
        "Downstream speed = 4v, upstream speed = 2v. Time upstream = 2 * Downstream time. Hence, additional time = downstream time."
      );
    }
    case 24: {
      return makeMcq(
        "Boat Speed in Still Water",
        isAT1
          ? "A boat goes 24 km upstream and 36 km downstream in 6 hours. In 8 hours, it goes 32 km upstream and 48 km downstream. Determine the speed of the boat in still water."
          : "A boat goes 27 km upstream and 45 km downstream in 6 hours. In 8 hours, it goes 36 km upstream and 60 km downstream. Determine the speed of the boat in still water.",
        isAT1 ? ["10 km/h", "8 km/h", "12 km/h", "14 km/h"] : ["12 km/h", "10 km/h", "14 km/h", "15 km/h"],
        0,
        isAT1
          ? "Upstream speed = u - v = 8 km/h, downstream speed = u + v = 12 km/h. Boat speed in still water u = (12 + 8)/2 = 10 km/h and stream v = 2 km/h."
          : "Upstream speed = u - v = 9 km/h, downstream speed = u + v = 15 km/h. Boat speed in still water u = (15 + 9)/2 = 12 km/h and stream v = 3 km/h."
      );
    }
    case 25: {
      return makeMcq(
        "City Sector Revenue Comparison",
        `In a metropolitan area, last year's tourism revenue accounted for ${isAT1 ? "25%" : "20%"} of overall revenue, with the remaining $${isAT1 ? "750,000" : "600,000"} coming from tech manufacturing. This year, tourism revenue fell by 60%, while manufacturing rose by 150%. What percentage of this year's manufacturing revenue is the revenue from tourism?`,
        ["4%", "5.33%", "6.67%", "8%"],
        isAT1 ? 1 : 1,
        "Calculate previous revenues, apply respective percentage changes, and compute the ratio."
      );
    }
    case 26: {
      return makeMcq(
        "School Age Demographics",
        `In a school, 20% of students are below 8 years of age. The number of students above 8 years is 2/3 of the students of 8 years of age, which is ${isAT1 ? "60" : "48"}. What is the total number of students in the school?`,
        [isAT1 ? "125" : "100", isAT1 ? "150" : "125", isAT1 ? "175" : "150", isAT1 ? "200" : "175"],
        0,
        "Students of 8 yrs = N. Students above 8 = (2/3)N. Total of age >= 8 is 80% of student population. Total = (N + (2/3)N) / 0.80."
      );
    }
    case 27: {
      return makeMcq(
        "Valid Votes in Election",
        `In an election between two candidates, one got ${isAT1 ? "60%" : "55%"} of the total valid votes, and 20% of the total votes were invalid. If the total number of votes was ${isAT1 ? "8,000" : "7,500"}, the number of valid votes that the other candidate received was:`,
        [isAT1 ? "2,560" : "2,700", isAT1 ? "3,200" : "3,000", isAT1 ? "3,840" : "3,300", isAT1 ? "4,200" : "3,600"],
        0,
        "Valid votes = 80% of total. Other candidate gets (100 - winning)% of valid votes."
      );
    }
    case 28: {
      return makeMcq(
        "Income and Expense Ratio",
        isAT1
          ? "The incomes of Alex, Bob, and Charlie are in the ratio 7 : 9 : 12, while their expenses are in the ratio 8 : 9 : 15. If their respective savings are Rs. 200, Rs. 450, and Rs. 150, what is Alex's income?"
          : "The incomes of Alex, Bob, and Charlie are in the ratio 5 : 7 : 9, while their expenses are in the ratio 4 : 5 : 7. If their respective savings are Rs. 700, Rs. 1,100, and Rs. 1,300, what is Alex's income?",
        isAT1 ? ["Rs. 1,400", "Rs. 1,200", "Rs. 1,600", "Rs. 1,800"] : ["Rs. 1,500", "Rs. 1,400", "Rs. 1,600", "Rs. 1,800"],
        0,
        isAT1
          ? "7x - 8y = 200 and 9x - 9y = 450 => x - y = 50. Substituting yields x = 200, y = 150. Alex's income = 7 * 200 = Rs. 1,400."
          : "5x - 4y = 700 and 7x - 5y = 1100. Solving simultaneous equations gives y = 200 and x = 300. Alex's income = 5 * 300 = Rs. 1,500."
      );
    }
    case 29: {
      return makeMcq(
        "Work Left Together",
        `A can complete a task in ${isAT1 ? "12 days" : "15 days"} and B in ${isAT1 ? "18 days" : "20 days"}. If they work together for 4 days, what fraction of the work remains unfinished?`,
        [isAT1 ? "4/9" : "8/15", isAT1 ? "5/9" : "7/15", isAT1 ? "1/3" : "2/5", isAT1 ? "2/9" : "1/5"],
        0,
        "Work done in 4 days = 4 * (1/d1 + 1/d2). Work remaining = 1 - Work done."
      );
    }
    case 30: {
      return makeMcq(
        "Assisted Work Schedule",
        `A, B, and C can complete a job in ${isAT1 ? "20, 30, and 60 days" : "15, 20, and 30 days"} respectively. In how many days can A do the work if he is assisted by B and C on every third day?`,
        [isAT1 ? "15 days" : "10 days", isAT1 ? "12 days" : "8 days", isAT1 ? "18 days" : "12 days", isAT1 ? "20 days" : "14 days"],
        0,
        "Calculate 3-day work cycle: Day 1 (A) + Day 2 (A) + Day 3 (A+B+C). Total cycles to complete 1 unit of work."
      );
    }
    case 31: {
      return makeMcq(
        "Percentage Expression Evaluation",
        `Evaluate: 25% of ${isAT1 ? "40 + 25% of 60 - 15% of 200" : "48 + 50% of 32 - 10% of 250"} = ?`,
        [isAT1 ? "-5" : "3", isAT1 ? "0" : "5", isAT1 ? "-10" : "-3", isAT1 ? "5" : "-5"],
        isAT1 ? 0 : 0,
        "Calculate each percentage term and combine using arithmetic order."
      );
    }
    case 32: {
      return makeMcq(
        "Decade Population Growth Rate",
        `The population of a city increased from ${isAT1 ? "2,00,000 to 3,00,000" : "1,50,000 to 2,25,000"} in a decade. The average percentage increase of population per year is:`,
        ["5%", "6%", "7.5%", "8%"],
        0,
        "Total decade increase = 50%. Average per year = 50% / 10 = 5%."
      );
    }
    case 33: {
      return makeMcq(
        "Compound Ratio A:B:C:D",
        `If A:B is ${isAT1 ? "1:2" : "2:3"}, B:C is ${isAT1 ? "3:4" : "4:5"}, and C:D is ${isAT1 ? "2:3" : "1:2"}, find A:B:C:D.`,
        [isAT1 ? "3:6:8:12" : "8:12:15:30", isAT1 ? "2:4:6:9" : "6:9:12:24", isAT1 ? "1:2:3:4" : "4:6:8:15", isAT1 ? "3:5:7:9" : "2:3:5:10"],
        0,
        "Multiply ratio terms sequentially to harmonize intermediate values."
      );
    }
    case 34: {
      return makeMcq(
        "Ratio and Sum to Difference",
        `The ratio of two numbers is ${isAT1 ? "7 : 9" : "11 : 13"}. If the sum of the numbers is ${isAT1 ? "256" : "288"}, find the difference between the numbers.`,
        [isAT1 ? "32" : "24", isAT1 ? "28" : "20", isAT1 ? "36" : "28", isAT1 ? "40" : "32"],
        0,
        "Sum parts = a+b. 1 part = Sum / (a+b). Difference = |a - b| * (1 part)."
      );
    }
    case 35: {
      return makeMcq(
        "Age Ratio Difference in Months",
        `The ages of three siblings are in the ratio ${isAT1 ? "4 : 7 : 9" : "5 : 8 : 11"}. If the sum of their ages is ${isAT1 ? "40 years" : "48 years"}, find the difference between the eldest and the youngest in months.`,
        [isAT1 ? "120 months" : "144 months", isAT1 ? "108 months" : "120 months", isAT1 ? "96 months" : "108 months", isAT1 ? "132 months" : "132 months"],
        0,
        "1 part = Total / SumOfParts. Difference in years = (Eldest - Youngest) * part. Convert to months (* 12)."
      );
    }
    case 36: {
      return makeMcq(
        "Numbers Relative to Third",
        `Two numbers are respectively ${isAT1 ? "30% and 60%" : "25% and 50%"} more than a third number. The ratio of the two numbers is:`,
        [isAT1 ? "13 : 16" : "5 : 6", isAT1 ? "3 : 4" : "4 : 5", isAT1 ? "11 : 14" : "2 : 3", isAT1 ? "15 : 19" : "3 : 5"],
        0,
        "Let third be 100. Numbers are 100+p1 and 100+p2. Simplify ratio."
      );
    }
    case 37: {
      return makeMcq(
        "Proportional Distribution Difference",
        `A sum of money is divided among A, B, C, and D in the ratio ${isAT1 ? "4 : 3 : 6 : 2" : "5 : 3 : 7 : 4"}. If C receives Rs. ${isAT1 ? "1,200" : "900"} more than D, what is B's share?`,
        [isAT1 ? "Rs. 900" : "Rs. 900", isAT1 ? "Rs. 750" : "Rs. 600", isAT1 ? "Rs. 1,050" : "Rs. 1,200", isAT1 ? "Rs. 1,200" : "Rs. 750"],
        0,
        "Difference between C and D is (c - d) parts = Rs. Diff => 1 part = Diff / (c - d). B's share = b * 1 part."
      );
    }
    case 38: {
      return makeMcq(
        "Solving Proportion Unknown",
        `If ${isAT1 ? "0.6 : x :: 3 : 5" : "0.8 : x :: 4 : 7"}, then x is equal to:`,
        [isAT1 ? "1.0" : "1.4", isAT1 ? "1.2" : "1.6", isAT1 ? "0.8" : "1.2", isAT1 ? "1.5" : "1.8"],
        0,
        "x = (a * d) / b."
      );
    }
    case 39: {
      return makeMcq(
        "Intermediate Ratio and Sum",
        isAT1
          ? "The sum of three numbers is 105. If the ratio of the first to the second is 2 : 3 and that of the second to the third is 4 : 5, then the second number is:"
          : "The sum of three numbers is 140. If the ratio of the first to the second is 2 : 3 and that of the second to the third is 4 : 5, then the second number is:",
        isAT1 ? ["36", "24", "45", "48"] : ["48", "32", "60", "40"],
        0,
        isAT1
          ? "First:Second = 2:3 = 8:12. Second:Third = 4:5 = 12:15. Combined ratio = 8 : 12 : 15. Total parts = 35. Second number = (12/35) * 105 = 36."
          : "First:Second = 2:3 = 8:12. Second:Third = 4:5 = 12:15. Combined ratio = 8 : 12 : 15. Total parts = 35. Second number = (12/35) * 140 = 48."
      );
    }
    case 40: {
      return makeMcq(
        "Reciprocal Ratio Division",
        `If Rs. ${isAT1 ? "940" : "1,170"} is divided into three parts proportional to 1/2 : 1/3 : 1/4, then the first part is:`,
        [isAT1 ? "Rs. 433.85" : "Rs. 540", isAT1 ? "Rs. 420" : "Rs. 480", isAT1 ? "Rs. 450" : "Rs. 360", isAT1 ? "Rs. 400" : "Rs. 600"],
        0,
        "Common denominator of 2, 3, 4 is 12 => ratio is 6 : 4 : 3. Sum = 13 parts. First part = (6/13) * Total."
      );
    }
    case 41: {
      return makeMcq(
        "Overlapping Averages of Three Persons",
        `The average weight of A, B, and C is ${isAT1 ? "50 kg" : "60 kg"}. If the average weight of A and B is ${isAT1 ? "45 kg" : "55 kg"} and that of B and C is ${isAT1 ? "48 kg" : "58 kg"}, then the weight of B is:`,
        [isAT1 ? "36 kg" : "46 kg", isAT1 ? "38 kg" : "48 kg", isAT1 ? "40 kg" : "50 kg", isAT1 ? "42 kg" : "52 kg"],
        0,
        "Weight of B = (A+B) + (B+C) - (A+B+C) = 2*(45) + 2*(48) - 3*(50) = 90 + 96 - 150 = 36 kg."
      );
    }
    case 42: {
      return makeMcq(
        "Correcting Misread Figure in Average",
        `The average weight of 40 students is ${isAT1 ? "52 kg" : "48 kg"}. It was found later that one weight of ${isAT1 ? "35 kg was misread as 75 kg" : "28 kg was misread as 68 kg"}. What is the correct average?`,
        [isAT1 ? "51 kg" : "47 kg", isAT1 ? "50.5 kg" : "46.5 kg", isAT1 ? "51.5 kg" : "47.5 kg", isAT1 ? "50 kg" : "46 kg"],
        0,
        "Sum error = Misread - Correct = 40 kg excess. Average adjustment = -40 / 40 = -1 kg."
      );
    }
    case 43: {
      return makeMcq(
        "Teacher Age Added to Class Average",
        `The average age of ${isAT1 ? "25 students is 12 years" : "35 students is 11 years"}. If the teacher's age is included, the average increases by 1 year. What is the age of the teacher?`,
        [isAT1 ? "38 years" : "47 years", isAT1 ? "36 years" : "45 years", isAT1 ? "40 years" : "49 years", isAT1 ? "42 years" : "51 years"],
        0,
        "Teacher's age = New Average + (Initial Students * Increase in Average)."
      );
    }
    case 44: {
      return makeMcq(
        "Passed and Failed Candidate Averages",
        `The average marks of ${isAT1 ? "150 candidates was 40" : "100 candidates was 35"}. If the average of passed candidates was ${isAT1 ? "45" : "40"} and failed candidates was ${isAT1 ? "20" : "15"}, the number of candidates who passed is:`,
        [isAT1 ? "120" : "80", isAT1 ? "110" : "75", isAT1 ? "125" : "85", isAT1 ? "130" : "90"],
        0,
        "Using alligation: (Avg - Failed) : (Passed - Avg) gives the ratio of passed to failed students."
      );
    }
    case 45: {
      return makeMcq(
        "Age Ratio Past and Present",
        `Five years ago, the ages of A and B were in the ratio 2 : 3. At present, the ratio is 3 : 4. Find the present age of A:`,
        ["15 years", "18 years", "20 years", "24 years"],
        0,
        "Let ages 5 yrs ago be 2x and 3x. (2x + 5)/(3x + 5) = 3/4 => 8x + 20 = 9x + 15 => x = 5. Present age of A = 2(5) + 5 = 15 years."
      );
    }
    case 46: {
      return makeMcq(
        "Age Progression Ratio",
        `Two years ago, the ratio of Ron and Sam's ages was 3 : 4. Six years hence, this ratio will become 5 : 6. How old is Sam now?`,
        ["18 years", "16 years", "20 years", "22 years"],
        0,
        "Difference in years = 8. (3x + 8)/(4x + 8) = 5/6 => 18x + 48 = 20x + 40 => 2x = 8 => x = 4. Sam's present age = 4(4) + 2 = 18 years."
      );
    }
    case 47: {
      return makeMcq(
        "Present Age and Future Ratio",
        `Present ages of Rahul and Amit are in the ratio 6 : 5. Four years hence, their ages will be in the ratio 7 : 6. What is Amit's present age?`,
        ["20 years", "24 years", "28 years", "32 years"],
        0,
        "Ratio increments by 1 unit in 4 years => 1 unit = 4 years. Amit's present age = 5 * 4 = 20 years."
      );
    }
    case 48: {
      return makeMcq(
        "Father and Son Multiplier Ratio",
        `Four years ago, a father was 6 times as old as his son. At present, the father is 4 times as old as his son. What are their present ages?`,
        ["40, 10", "36, 9", "48, 12", "32, 8"],
        0,
        "(4x - 4) = 6(x - 4) => 4x - 4 = 6x - 24 => 2x = 20 => x = 10 (son) and 40 (father)."
      );
    }
    case 49: {
      return makeMcq(
        "Age Total from Past Fraction",
        `Eight years ago, P was one-third of Q in age. If the ratio of their present ages is 3 : 5, what is the sum of their present ages?`,
        ["32 years", "40 years", "48 years", "56 years"],
        0,
        "Set up equation (3x - 8) = (1/3)(5x - 8) => 9x - 24 = 5x - 8 => 4x = 16 => x = 4. Total = 8x = 32 years."
      );
    }
    case 50: {
      return makeMcq(
        "Age Ratio Multiplier",
        `Ten years ago, P was half of Q in age. If the ratio of their present ages is 3 : 4, what is the total of their present ages?`,
        ["35 years", "40 years", "45 years", "50 years"],
        0,
        "(3x - 10) = 0.5 * (4x - 10) => 3x - 10 = 2x - 5 => x = 5. Total = 7x = 35 years."
      );
    }
    case 51: {
      return makeMcq(
        "Half-Yearly Compound Interest Installments",
        `A bank offers 6% compound interest calculated on a half-yearly basis. A customer deposits Rs. ${isAT1 ? "2,000" : "1,000"} each on 1st January and 1st July of a year. At the end of the year, the amount gained by way of interest is:`,
        [isAT1 ? "Rs. 181.80" : "Rs. 90.90", isAT1 ? "Rs. 175.00" : "Rs. 85.00", isAT1 ? "Rs. 192.40" : "Rs. 96.20", isAT1 ? "Rs. 160.00" : "Rs. 80.00"],
        0,
        "Jan 1 deposit earns interest for 2 half-years (r=3%), July 1 deposit earns interest for 1 half-year."
      );
    }
    case 52: {
      return makeMcq(
        "Difference Between CI and SI for 2 Years",
        `The difference between simple and compound interests compounded annually on a sum for 2 years at ${isAT1 ? "5% per annum is Rs. 15" : "4% per annum is Rs. 20"}. The sum is:`,
        [isAT1 ? "Rs. 6,000" : "Rs. 12,500", isAT1 ? "Rs. 5,000" : "Rs. 10,000", isAT1 ? "Rs. 7,200" : "Rs. 15,000", isAT1 ? "Rs. 8,000" : "Rs. 16,000"],
        0,
        "Diff = P * (r/100)^2 => P = Diff / (r/100)^2."
      );
    }
    case 53: {
      return makeMcq(
        "Age Multiplier Progression",
        "A father is aged three times more than his son Ronit. After 8 years, he would be two and a half times of Ronit's age. After further 8 years, how many times would he be of Ronit's age?",
        ["2 times", "2.25 times", "2.5 times", "3 times"],
        0,
        "Father = 4x, Son = x. After 8 yrs, 4x+8 = 2.5(x+8) => 1.5x = 12 => x = 8. Father = 32, son = 8. After 16 yrs: Father 48, son 24 => exactly 2 times."
      );
    }
    case 54: {
      return makeMcq(
        "Birth Age Equality Puzzle",
        "A father said to his son, 'I was as old as you are at the present at the time of your birth'. If the father's age is 42 years now, the son's age five years back was:",
        ["16 years", "18 years", "21 years", "26 years"],
        0,
        "Let son's present age be x. Father was x at son's birth, so father's present age = 2x = 42 => x = 21. Five years back, son was 21 - 5 = 16 years."
      );
    }
    case 55: {
      return makeMcq(
        "Card Drawing Probability",
        "A card is drawn from a well-shuffled pack of 52 playing cards. What is the probability of getting a queen of clubs or a king of hearts?",
        ["1/26", "1/52", "2/13", "1/13"],
        0,
        "There is 1 queen of clubs and 1 king of hearts. Total favorable outcomes = 2. Probability = 2/52 = 1/26."
      );
    }
    case 56: {
      return makeMcq(
        "Committee Selection Combination",
        "From a group of 6 men and 5 women, a committee of 4 persons is to be formed so that at least 2 men are on the committee. In how many ways can this be done?",
        ["265 ways", "280 ways", "295 ways", "310 ways"],
        0,
        "Ways = (2 Men & 2 Women) + (3 Men & 1 Woman) + (4 Men) = (6C2 * 5C2) + (6C3 * 5C1) + (6C4) = (15 * 10) + (20 * 5) + 15 = 150 + 100 + 15 = 265 ways."
      );
    }
    case 57: {
      return makeMcq(
        "Permutation of Word with Vowels Together",
        `In how many different ways can the letters of the word '${isAT1 ? "DETAIL" : "DESIGN"}' be arranged in such a way that the vowels always come together?`,
        [isAT1 ? "144" : "144", isAT1 ? "120" : "120", isAT1 ? "240" : "240", isAT1 ? "720" : "720"],
        0,
        "Bundle the vowels into a single unit, arrange the units, and multiply by permutations of the vowels inside the bundle."
      );
    }
    case 58: {
      return makeMcq(
        "Caselet: Salary Comparison",
        "Seeta, Reeta and Geeta spend 12%, 14% and 16% of their monthly salary on travelling respectively and each saves half of the remaining amount. Seeta and Geeta have identical monthly salaries. Seeta's monthly saving is Rs. 360 more than Geeta's, and the travelling expenditure of Seeta and Reeta together is Rs. 1240 more than that of Geeta. The monthly salary of Reeta is how much less than that of Seeta?",
        ["Rs. 4,000 less", "Rs. 3,000 less", "Rs. 2,000 less", "Rs. 5,000 less"],
        0,
        "Seeta/Geeta salary S: (1/2)*0.88 S - (1/2)*0.84 S = 0.02 S = 360 => S = Rs. 18,000. Travel: 0.12(18000) + 0.14(R) = 0.16(18000) + 1240 => 2160 + 0.14 R = 2880 + 1240 = 4120 => 0.14 R = 1960 => R = Rs. 14,000. Reeta is Rs. 4,000 less than Seeta."
      );
    }
    case 59: {
      return makeMcq(
        "Caselet: Total Savings",
        "Based on the salary data of Seeta, Reeta and Geeta (Salaries: Seeta = Rs. 18,000, Reeta = Rs. 14,000, Geeta = Rs. 18,000; travel spends 12%, 14%, 16%; savings = half of remainder), what is the sum of the savings of all three friends together?",
        ["Rs. 21,500", "Rs. 22,000", "Rs. 23,500", "Rs. 24,000"],
        0,
        "Savings: Seeta = 0.44 * 18000 = 7920; Reeta = 0.43 * 14000 = 6020; Geeta = 0.42 * 18000 = 7560. Total = 7920 + 6020 + 7560 = Rs. 21,500."
      );
    }
    case 60: {
      return makeMcq(
        "Caselet: Total Savings Percentage",
        "Based on the salary data of Seeta, Reeta and Geeta (Total monthly savings = Rs. 21,500, Total monthly salary = Rs. 50,000), the total monthly savings of the three friends together is what percentage of their total monthly salary?",
        ["43%", "45%", "48%", "50%"],
        0,
        "(21,500 / 50,000) * 100 = 43%."
      );
    }
    case 61: {
      return makeMcq(
        "Linear Age Equation",
        "Rajeev's age after 15 years will be 5 times his age 5 years back. What is the present age of Rajeev?",
        ["10 years", "8 years", "12 years", "15 years"],
        0,
        "R + 15 = 5(R - 5) => R + 15 = 5R - 25 => 4R = 40 => R = 10 years."
      );
    }
    case 62: {
      return makeMcq(
        "Age Ratio and Future Offset",
        "The ratio between Rahul and Deepak's ages is 4 : 3. After 6 years, Rahul's age will be 26 years. What is the present age of Deepak?",
        ["15 years", "12 years", "18 years", "20 years"],
        0,
        "Rahul present age = 26 - 6 = 20 years. 4x = 20 => x = 5. Deepak's present age = 3 * 5 = 15 years."
      );
    }
    case 63: {
      return makeMcq(
        "Age Product and Future Ratio",
        "The ratio of a father's age to his son's age is 4 : 1. The product of their ages is 196. What will be the ratio of their ages after 5 years?",
        ["11 : 4", "5 : 2", "11 : 6", "13 : 5"],
        0,
        "4x * x = 196 => 4x^2 = 196 => x^2 = 49 => x = 7. Present ages: 28 and 7. After 5 years: 33 and 12 => 33:12 = 11:4."
      );
    }
    case 64: {
      return makeMcq(
        "Three-Person Age Chain",
        "A is two years older than B, who is twice as old as C. If the total of the ages of A, B, and C is 27, how old is B?",
        ["10 years", "8 years", "12 years", "14 years"],
        0,
        "Let C = x, B = 2x, A = 2x + 2. Sum: 5x + 2 = 27 => 5x = 25 => x = 5. B = 2(5) = 10 years."
      );
    }
    case 65: {
      return makeMcq(
        "Group Average Age Subtraction",
        "The average age of Ram and Shyam is 65 years. The average age of Ram, Shyam, and John is 53 years. What is the age of John?",
        ["29 years", "27 years", "31 years", "33 years"],
        0,
        "Ram + Shyam = 2 * 65 = 130. Ram + Shyam + John = 3 * 53 = 159. John = 159 - 130 = 29 years."
      );
    }
    case 66: {
      return makeMcq(
        "Partnership with Charity Deduction",
        "A and B invest in a business in the ratio 3 : 2. If 5% of the total profit goes to charity and A's share of the remaining profit is Rs. 855, what is the total profit?",
        ["Rs. 1,500", "Rs. 1,425", "Rs. 1,600", "Rs. 1,750"],
        0,
        "A gets (3/5) of 95% of Profit = 0.57 * Profit = 855 => Profit = 855 / 0.57 = Rs. 1,500."
      );
    }
    case 67: {
      return makeMcq(
        "Partnership Capital Contribution",
        "A starts a business with Rs. 3,500 and after 5 months, B joins as a partner. After a full year, the profit is divided in the ratio 2 : 3. What was B's capital contribution?",
        ["Rs. 9,000", "Rs. 8,500", "Rs. 7,500", "Rs. 8,000"],
        0,
        "(3500 * 12) / (B * 7) = 2 / 3 => 42000 / 7B = 2/3 => 6000 / B = 2/3 => B = Rs. 9,000."
      );
    }
    case 68: {
      return makeMcq(
        "Staggered Multi-Year Partnership",
        "Simran started a business investing Rs. 50,000. After six months, Nanda joined with Rs. 80,000. After 3 years, they earned a total profit of Rs. 24,500. What was Simran's share in the profit?",
        ["Rs. 10,500", "Rs. 9,423", "Rs. 12,500", "Rs. 14,000"],
        0,
        "Simran: 50,000 * 36 = 1,800,000. Nanda: 80,000 * 30 = 2,400,000. Ratio = 18 : 24 = 3 : 4. Simran's share = (3/7) * 24500 = Rs. 10,500."
      );
    }
    case 69: {
      return makeMcq(
        "Direct Investment Profit Sharing",
        `If Rs. ${isAT1 ? "100,000 and Rs. 150,000" : "120,000 and Rs. 180,000"} are invested by A and B respectively, and the annual profit is Rs. ${isAT1 ? "24,000" : "30,000"}, what is A's share?`,
        [isAT1 ? "Rs. 9,600" : "Rs. 12,000", isAT1 ? "Rs. 8,000" : "Rs. 10,000", isAT1 ? "Rs. 10,500" : "Rs. 14,000", isAT1 ? "Rs. 12,000" : "Rs. 15,000"],
        0,
        "Investment ratio is 2 : 3. A's share = (2/5) * Total Profit."
      );
    }
    case 70: {
      return makeMcq(
        "Finding Unknown Partner Capital",
        `X and Y invested in a business and divided profits in the ratio 2 : 3. If X invested Rs. ${isAT1 ? "40,000" : "60,000"}, find the capital invested by Y:`,
        [isAT1 ? "Rs. 60,000" : "Rs. 90,000", isAT1 ? "Rs. 50,000" : "Rs. 80,000", isAT1 ? "Rs. 75,000" : "Rs. 100,000", isAT1 ? "Rs. 80,000" : "Rs. 120,000"],
        0,
        "40000 / Y = 2/3 => Y = Rs. 60,000."
      );
    }
    case 71: {
      return makeMcq(
        "Three-Partner Profit Share",
        "A, B, and C started a business by investing Rs. 25,000, Rs. 30,000, and Rs. 35,000 respectively. Find the share of B out of an annual profit of Rs. 187,200:",
        ["Rs. 62,400", "Rs. 52,000", "Rs. 72,800", "Rs. 65,400"],
        0,
        "Ratio = 25 : 30 : 35 = 5 : 6 : 7. Total parts = 18. B's share = (6/18) * 187200 = (1/3) * 187200 = Rs. 62,400."
      );
    }
    case 72: {
      return makeMcq(
        "Cascading Half Shares",
        "Rs. 1,400 is divided among Amla, Bimla, and Simla so that Amla receives half as much as Bimla, and Bimla receives half as much as Simla. What is Simla's share?",
        ["Rs. 800", "Rs. 400", "Rs. 600", "Rs. 700"],
        0,
        "Let Simla = 4x, Bimla = 2x, Amla = x. Total = 7x = 1400 => x = 200. Simla = 4(200) = Rs. 800."
      );
    }
    case 73: {
      return makeMcq(
        "Two-Year Profit Ratio Simplification",
        "Smith and Kate started a venture investing Rs. 84,000 and Rs. 28,000 respectively. In what ratio should the profit earned after 2 years be divided between Smith and Kate?",
        ["3 : 1", "2 : 1", "4 : 1", "5 : 2"],
        0,
        "84000 : 28000 = 84 : 28 = 3 : 1."
      );
    }
    case 74: {
      return makeMcq(
        "Finding Partner Capital from Profit Ratio",
        "Sham and Ram gained profit divided in the ratio 2 : 3. If Sham invested Rs. 40,000, what was the capital invested by Ram?",
        ["Rs. 60,000", "Rs. 50,000", "Rs. 75,000", "Rs. 80,000"],
        0,
        "40000 / Ram = 2/3 => Ram = Rs. 60,000."
      );
    }
    case 75: {
      return makeMcq(
        "Total Profit from Known Share",
        "Harry, John, and Smith start a business investing Rs. 27,000, Rs. 72,000, and Rs. 81,000 respectively. At the end of the year, Smith earns a profit share of Rs. 36,000. Find the total profit:",
        ["Rs. 80,000", "Rs. 75,000", "Rs. 90,000", "Rs. 85,000"],
        0,
        "Ratio = 27 : 72 : 81 = 3 : 8 : 9. Total parts = 20. Smith share = (9/20)*Total = 36000 => Total = 36000 * 20 / 9 = Rs. 80,000."
      );
    }
    case 76: {
      return makeMcq(
        "Alligation of Sugar Varieties",
        `In what ratio should two varieties of sugar of Rs. ${isAT1 ? "18/kg and Rs. 24/kg" : "15/kg and Rs. 25/kg"} be mixed together to get a mixture whose cost is Rs. ${isAT1 ? "20/kg" : "21/kg"}?`,
        [isAT1 ? "2 : 1" : "2 : 3", isAT1 ? "1 : 2" : "3 : 2", isAT1 ? "3 : 1" : "1 : 2", isAT1 ? "4 : 1" : "3 : 4"],
        0,
        "Using alligation: (24 - 20) : (20 - 18) = 4 : 2 = 2 : 1."
      );
    }
    case 77: {
      return makeMcq(
        "Spirit and Water Mixture Alligation",
        "Two vessels A and B contain spirit and water in the ratio 5 : 2 and 7 : 6 respectively. Find the ratio in which these mixtures must be combined to obtain a new mixture containing spirit and water in the ratio 8 : 5:",
        ["7 : 9", "5 : 7", "6 : 7", "8 : 9"],
        0,
        "Fraction of spirit: A = 5/7, B = 7/13, Mean = 8/13. Alligation gives (8/13 - 7/13) : (5/7 - 8/13) = 1/13 : 9/91 = 7 : 9."
      );
    }
    case 78: {
      return makeMcq(
        "Water Dilution to Reduce Cost",
        `How much water must be added to ${isAT1 ? "40 litres" : "50 litres"} of milk at the cost price of Rs. 3.50 per litre so that the cost of the diluted milk is reduced to Rs. 2.00 per litre?`,
        [isAT1 ? "30 litres" : "37.5 litres", isAT1 ? "25 litres" : "30 litres", isAT1 ? "35 litres" : "40 litres", isAT1 ? "20 litres" : "25 litres"],
        0,
        "Total cost = 40 * 3.50 = 140. New volume = 140 / 2 = 70 litres. Water added = 70 - 40 = 30 litres."
      );
    }
    case 79: {
      return makeMcq(
        "Dishonest Milkman Water Percentage",
        "A dishonest milkman professes to sell milk at cost price but mixes it with water and thereby gains 25%. What is the percentage of water in the final mixture?",
        ["20%", "25%", "15%", "30%"],
        0,
        "Water : Milk = 25 : 100 = 1 : 4. Percentage of water in mixture = 1 / (1 + 4) * 100 = 20%."
      );
    }
    case 80: {
      return makeMcq(
        "Adjusting Ratio by Adding Water",
        "In a 729-litre mixture of milk and water, the ratio of milk to water is 7 : 2. To obtain a new mixture containing milk and water in the ratio 7 : 3, what amount of water must be added?",
        ["81 litres", "75 litres", "90 litres", "65 litres"],
        0,
        "Total parts = 9. 1 part = 729 / 9 = 81 litres. Milk is 7 parts (567L), water is 2 parts (162L). To make ratio 7:3, water needed is 3 parts = 243L. Water added = 243 - 162 = 81 litres."
      );
    }
    case 81: {
      return makeMcq(
        "Wheat Pricing Alligation",
        "In what ratio must wheat A at Rs. 10.50 per kg be mixed with wheat B at Rs. 12.30 per kg so that the mixture is worth Rs. 11.00 per kg?",
        ["13 : 5", "11 : 5", "12 : 7", "14 : 5"],
        0,
        "Alligation: (12.30 - 11.00) : (11.00 - 10.50) = 1.30 : 0.50 = 13 : 5."
      );
    }
    case 82: {
      return makeMcq(
        "Peas and Soybean Mixture",
        "In what ratio must a shopkeeper mix Peas at Rs. 16/kg and Soybeans at Rs. 25/kg to obtain a mixture worth Rs. 19.50/kg?",
        ["11 : 7", "9 : 5", "7 : 5", "12 : 8"],
        0,
        "Alligation: (25 - 19.50) : (19.50 - 16) = 5.5 : 3.5 = 11 : 7."
      );
    }
    case 83: {
      return makeMcq(
        "Milk Container Proportions",
        "Two containers P and Q contain milk and water in the ratio 5 : 2 and 7 : 6 respectively. Find the ratio in which these two mixtures should be combined to produce a mixture R with ratio 8 : 5:",
        ["7 : 9", "5 : 6", "4 : 9", "9 : 7"],
        0,
        "By alligation on milk concentration: (5/7) and (7/13) to obtain (8/13) yields 7 : 9."
      );
    }
    case 84: {
      return makeMcq(
        "Successive Replacement of Liquid",
        "A container contains 30 litres of pure milk. From this container, 5 litres of milk is taken out and replaced by water. This process is repeated further two times. How much pure milk remains in the container?",
        ["17.36 litres", "18.45 litres", "21.87 litres", "23.44 litres"],
        0,
        "Remaining milk = 30 * (1 - 5/30)^3 = 30 * (5/6)^3 = 30 * (125/216) ≈ 17.36 litres."
      );
    }
    case 85: {
      return makeMcq(
        "Simple Interest for Months",
        `What will be the simple interest on Rs. ${isAT1 ? "80,000 at 10% per annum for 9 months" : "60,000 at 8% per annum for 9 months"}?`,
        [isAT1 ? "Rs. 6,000" : "Rs. 3,600", isAT1 ? "Rs. 8,000" : "Rs. 4,200", isAT1 ? "Rs. 7,500" : "Rs. 4,800", isAT1 ? "Rs. 5,400" : "Rs. 3,200"],
        0,
        "SI = (P * R * T) / 100 where T = 9/12 = 0.75 years."
      );
    }
    case 86: {
      return makeMcq(
        "Rate to Double Money",
        `At what rate percent per annum will a sum of money double itself in ${isAT1 ? "20 years" : "16 years"} at simple interest?`,
        [isAT1 ? "5%" : "6.25%", isAT1 ? "4%" : "5.5%", isAT1 ? "6%" : "7.0%", isAT1 ? "8%" : "8.0%"],
        0,
        "To double, Interest = P => P = (P * R * T)/100 => R = 100 / T."
      );
    }
    case 87: {
      return makeMcq(
        "Principal from 3-Year and 4-Year Amounts",
        "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The principal sum is:",
        ["Rs. 698", "Rs. 650", "Rs. 690", "Rs. 700"],
        0,
        "1 year interest = 854 - 815 = Rs. 39. 3 years interest = 3 * 39 = Rs. 117. Principal = 815 - 117 = Rs. 698."
      );
    }
    case 88: {
      return makeMcq(
        "Simple Interest Rate Calculation",
        "A sum of Rs. 12,500 amounts to Rs. 15,500 in 4 years at simple interest. What is the annual rate of interest?",
        ["6%", "4%", "5%", "7%"],
        0,
        "Interest = 15500 - 12500 = 3000. Rate = (3000 * 100) / (12500 * 4) = 300000 / 50000 = 6%."
      );
    }
    case 89: {
      return makeMcq(
        "Business Share of B",
        "A, B, and C invest Rs. 20,000, Rs. 25,000, and Rs. 35,000 in a business. Find the share of B out of a total profit of Rs. 128,000:",
        ["Rs. 40,000", "Rs. 32,000", "Rs. 45,000", "Rs. 48,000"],
        0,
        "Ratio = 4 : 5 : 7. Total parts = 16. B's share = (5/16) * 128000 = Rs. 40,000."
      );
    }
    case 90: {
      return makeMcq(
        "Three-Way Proportional Division",
        "Rs. 2,100 is divided among X, Y, and Z such that X receives half as much as Y, and Y receives half as much as Z. What is Z's share?",
        ["Rs. 1,200", "Rs. 600", "Rs. 900", "Rs. 1,000"],
        0,
        "X:Y:Z = 1:2:4. Total parts = 7. Z's share = (4/7) * 2100 = Rs. 1,200."
      );
    }
    case 91: {
      return makeMcq(
        "Simplified Profit Share Ratio",
        "P and Q start a business with Rs. 45,000 and Rs. 15,000 respectively. In what ratio should the profit after 1 year be divided?",
        ["3 : 1", "2 : 1", "4 : 1", "5 : 2"],
        0,
        "45000 : 15000 = 3 : 1."
      );
    }
    case 92: {
      return makeMcq(
        "Calculating Partner Investment",
        "A and B divide profit in the ratio 3 : 5. If A invested Rs. 45,000, what was B's investment?",
        ["Rs. 75,000", "Rs. 60,000", "Rs. 80,000", "Rs. 90,000"],
        0,
        "45000 / B = 3/5 => B = Rs. 75,000."
      );
    }
    case 93: {
      return makeMcq(
        "Deriving Total Profit",
        "Three partners invest in the ratio 2 : 5 : 8. The third partner earns Rs. 48,000 as profit. What is the total profit?",
        ["Rs. 90,000", "Rs. 80,000", "Rs. 96,000", "Rs. 100,000"],
        0,
        "8 parts = 48000 => 1 part = 6000. Total = 15 parts = Rs. 90,000."
      );
    }
    case 94: {
      return makeMcq(
        "Cost Price with Loss Percentage",
        "A shopkeeper sells an item for Rs. 240 at a loss of 20%. What is the cost price of the article?",
        ["Rs. 300", "Rs. 280", "Rs. 320", "Rs. 350"],
        0,
        "SP = 0.80 * CP => CP = 240 / 0.80 = Rs. 300."
      );
    }
    case 95: {
      return makeMcq(
        "Equal Selling and Cost Price Items",
        "The selling price of 10 candles is equal to the cost price of 12 candles. What is the gain percent?",
        ["20%", "15%", "25%", "18%"],
        0,
        "Gain % = ((12 - 10) / 10) * 100 = 20%."
      );
    }
    case 96: {
      return makeMcq(
        "Selling Price to Cost Price Loss",
        "The selling price of 40 articles is equal to the cost price of 35 articles. Find the profit or loss percent:",
        ["12.5% loss", "12.5% gain", "14.2% loss", "10% loss"],
        0,
        "Loss % = ((40 - 35) / 40) * 100 = (5/40) * 100 = 12.5% loss."
      );
    }
    case 97: {
      return makeMcq(
        "Markup and Discount Net Effect",
        "If a retailer marks up goods by 25% and then offers a 20% discount on the marked price, what is the net profit or loss percentage?",
        ["0% (No profit no loss)", "5% gain", "5% loss", "2% gain"],
        0,
        "Factor = 1.25 * 0.80 = 1.00 => Exactly 0% profit or loss."
      );
    }
    case 98: {
      return makeMcq(
        "Cost Price from Sale with 25% Profit",
        "A merchant made a profit of 25% by selling an outfit for Rs. 5,000. What was the cost price of the outfit?",
        ["Rs. 4,000", "Rs. 3,750", "Rs. 4,200", "Rs. 4,500"],
        0,
        "CP = 5000 / 1.25 = Rs. 4,000."
      );
    }
    case 99: {
      return makeMcq(
        "Grain Mixture Price Blend",
        "In what ratio must rice at Rs. 24/kg be mixed with premium rice at Rs. 34/kg to obtain a blend worth Rs. 30/kg?",
        ["2 : 3", "3 : 2", "1 : 2", "3 : 4"],
        0,
        "Alligation: (34 - 30) : (30 - 24) = 4 : 6 = 2 : 3."
      );
    }
    case 100: {
      return makeMcq(
        "Dry Fruit Blend Ratio",
        "In what ratio should cashews at Rs. 400/kg be mixed with almonds at Rs. 600/kg to achieve a blend priced at Rs. 480/kg?",
        ["3 : 2", "2 : 3", "1 : 1", "4 : 3"],
        0,
        "Alligation: (600 - 480) : (480 - 400) = 120 : 80 = 3 : 2."
      );
    }
    case 101: {
      return makeMcq(
        "Acid and Water Mixture Combination",
        "Two containers have acid and water in ratios 3 : 1 and 5 : 3. In what ratio must they be mixed to obtain a 2 : 1 ratio?",
        ["1 : 1", "2 : 1", "3 : 2", "1 : 2"],
        0,
        "Using alligation on acid proportions gives 1 : 1."
      );
    }
    case 102: {
      return makeMcq(
        "Triple Liquid Replacement",
        "A vat contains 40 litres of chemical solution. 4 litres are drawn off and replaced with water. This operation is repeated twice more. How much of the original chemical remains?",
        ["29.16 litres", "28.00 litres", "30.24 litres", "27.50 litres"],
        0,
        "Remaining = 40 * (1 - 4/40)^3 = 40 * (0.9)^3 = 40 * 0.729 = 29.16 litres."
      );
    }
    case 103: {
      return makeMcq(
        "Short-Term Simple Interest",
        "Find the simple interest on Rs. 45,000 at 8% per annum for 6 months:",
        ["Rs. 1,800", "Rs. 2,400", "Rs. 1,600", "Rs. 2,100"],
        0,
        "SI = 45000 * 0.08 * 0.5 = Rs. 1,800."
      );
    }
    case 104: {
      return makeMcq(
        "Doubling Investment Rate",
        "At what simple interest rate per annum will an initial deposit double in 10 years?",
        ["10%", "8%", "12%", "15%"],
        0,
        "Rate = 100 / 10 = 10%."
      );
    }
    case 105: {
      return makeMcq(
        "Simple Interest Principal Deduction",
        "A sum at simple interest amounts to Rs. 920 in 2 years and Rs. 1,040 in 3 years. What is the initial principal?",
        ["Rs. 680", "Rs. 720", "Rs. 640", "Rs. 700"],
        0,
        "1 year interest = 1040 - 920 = 120. Principal = 920 - 2(120) = Rs. 680."
      );
    }
    case 106: {
      return makeMcq(
        "Simple Interest Rate Finding",
        "A principal of Rs. 8,000 yields Rs. 1,920 interest over 3 years. What is the rate of interest per annum?",
        ["8%", "6%", "7.5%", "9%"],
        0,
        "Rate = (1920 * 100) / (8000 * 3) = 192000 / 24000 = 8%."
      );
    }
    case 107: {
      return makeMcq(
        "Alphanumeric Pattern Progression",
        "Find the missing term in the sequence: ABC, ABC2, AB2C2, _____, A2B2C3",
        ["A2B2C2", "ABC3", "AB3C2", "A3B2C2"],
        0,
        "Digits increment sequentially on each letter from left to right."
      );
    }
    case 108: {
      return makeMcq(
        "Letter Triplet Sequence",
        "Find the next term in the series: BLL, DNN, FPP, _____, JTT",
        ["HRR", "GQQ", "HSS", "IRR"],
        0,
        "First letter advances by +2 (B->D->F->H->J), second and third advance by +2 (L->N->P->R->T)."
      );
    }
    case 109: {
      return makeMcq(
        "Geometric Number Sequence",
        "Look at the series: 3, 9, 27, 81, ... What number should come next?",
        ["243", "162", "216", "324"],
        0,
        "Each term is multiplied by 3 (81 * 3 = 243)."
      );
    }
    case 110: {
      return makeMcq(
        "Recursive Sequence Pattern",
        "Look at the sequence: 5, 4, 6, 15, 56, ... What number should come next?",
        ["275", "265", "280", "290"],
        0,
        "Pattern: 5*1 - 1 = 4; 4*2 - 2 = 6; 6*3 - 3 = 15; 15*4 - 4 = 56; 56*5 - 5 = 275."
      );
    }
    case 111: {
      return makeMcq(
        "Syllogism: Desks, Chairs, and Tables",
        "Statements: All desks are chairs. No chair is a table.\nConclusions:\n(I) Some desks are tables.\n(II) No table is a desk.",
        ["Only (II) follows", "Only (I) follows", "Both follow", "Neither follows"],
        0,
        "Since all desks are inside chairs and disjoint from tables, no desk can be a table. Hence, conclusion (II) follows."
      );
    }
    case 112: {
      return makeMcq(
        "Coded Direction: Relative Coordinates",
        "Given the rules:\nA # B means B is 1m East of A\nA $ B means B is 1m North of A\nA * B means B is 1m West of A\nA @ B means B is 1m South of A\nAccording to P @ Q * R, in which direction is R with respect to P?",
        ["South-West", "North-East", "South-East", "North-West"],
        0,
        "Q is 1m South of P. R is 1m West of Q. Hence, R is South-West of P."
      );
    }
    case 113: {
      return makeMcq(
        "Coded Direction: Vector Step",
        "Using the same rules (# = East, $ = North, * = West, @ = South):\nAccording to J # K $ L, in which direction is L with respect to J?",
        ["North-East", "North-West", "South-East", "South-West"],
        0,
        "K is 1m East of J. L is 1m North of K. L is North-East of J."
      );
    }
    case 114: {
      return makeMcq(
        "Alternating Step Series",
        "Look at this series: 34, 33, 35, 34, 36, 35, ... What number should come next?",
        ["37", "36", "38", "34"],
        0,
        "Alternating pattern: -1, +2, -1, +2, -1, +2... Next is 35 + 2 = 37."
      );
    }
    case 115: {
      return makeMcq(
        "Dual Alternating Series",
        "Look at this series: 100, 20, 90, 25, 80, ... What number should come next?",
        ["30", "35", "70", "75"],
        0,
        "Odd terms decrease by 10 (100, 90, 80). Even terms increase by 5 (20, 25, 30)."
      );
    }
    case 116: {
      return makeMcq(
        "Morning Sun and Shadow Direction",
        "One morning after sunrise, Aarav and Varun were talking face to face. If Varun's shadow fell exactly to the left of Aarav, which direction was Aarav facing?",
        ["North", "South", "East", "West"],
        0,
        "In the morning, the sun is in the East, so shadows fall towards the West. If the shadow is to Aarav's left, Aarav is facing North."
      );
    }
    case 117: {
      return makeMcq(
        "Compass Rotation Orientation",
        "If South-East becomes North, North-East becomes West, and so on. What will West become in this coordinate system?",
        ["South-East", "North-West", "South-West", "North-East"],
        0,
        "The compass rotates 135 degrees clockwise. West rotated 135 degrees clockwise becomes South-East."
      );
    }
    case 118: {
      return makeMcq(
        "Clock Face Direction Alignment",
        "A clock is placed such that at 6:00 PM, the hour hand points North. In which direction will the minute hand point at 9:15 PM?",
        ["West", "East", "North", "South"],
        0,
        "At 6:00, the 6-position points North (rotated 180 deg). At 9:15, the minute hand is at 3, which is opposite to 9 (pointing West)."
      );
    }
    case 119: {
      return makeMcq(
        "Multi-Segment Walk Path",
        "From home, Maya walked 20 km North, turned West and walked 15 km, turned South and walked 8 km, then turned East and walked 15 km. In which direction and distance is she from her home?",
        ["12 km North", "12 km South", "15 km North", "8 km East"],
        0,
        "East/West displacements cancel (15 km W, 15 km E). Net North displacement = 20 - 8 = 12 km North."
      );
    }
    case 120: {
      return makeMcq(
        "Direct Blood Relation Identification",
        "Pointing to a photograph of a boy, Ramesh said, 'He is the son of the only son of my mother.' How is Ramesh related to the boy?",
        ["Father", "Uncle", "Brother", "Grandfather"],
        0,
        "Only son of Ramesh's mother is Ramesh himself. The boy is the son of Ramesh. Ramesh is his Father."
      );
    }
    case 121: {
      return makeMcq(
        "Grandfather Blood Relation Lineage",
        "Pointing to a photograph, Meera said, 'He is the son of the only son of my paternal grandfather.' How is the man in the photograph related to Meera?",
        ["Brother", "Father", "Cousin", "Uncle"],
        0,
        "The only son of Meera's paternal grandfather is Meera's father. The son of Meera's father is Meera's Brother."
      );
    }
    case 122: {
      return makeMcq(
        "Matrix Number Triangle Puzzle",
        "Consider the triangular pattern where bottom numbers (A, B, C) relate to the apex number:\nRow 1: (5, 4, 7) -> 8\nRow 2: (6, 9, 5) -> 10\nRow 3: (3, 7, 2) -> ?\nWhat number replaces the question mark?",
        ["6", "8", "10", "12"],
        0,
        "Pattern: (A * C) / B or (Sum of outer / 2) = 6."
      );
    }
    case 123: {
      return makeMcq(
        "Syllogism: Pens, Papers, and Folders",
        "Statements: All pens are papers. All papers are folders.\nConclusions:\n(I) Some folders are pens.\n(II) All pens are folders.",
        ["Both follow", "Only (I) follows", "Only (II) follows", "Neither follows"],
        0,
        "Both conclusions follow from transitive inclusion."
      );
    }
    case 124: {
      return makeMcq(
        "Syllogism: Birds and Airplanes",
        "Statements: All birds are fliers. Some kites are fliers.\nConclusions:\n(I) All birds are kites.\n(II) Some kites are birds.",
        ["Neither follows", "Only (I) follows", "Only (II) follows", "Both follow"],
        0,
        "No definite link exists between birds and kites."
      );
    }
    case 125: {
      return makeMcq(
        "Digit Truncation Sequence",
        "Look at the sequence: 589654237, 89654237, 8965423, 965423, ?\nWhat comes next?",
        ["96542", "96543", "65423", "96785"],
        0,
        "The pattern alternates dropping the first digit, then dropping the last digit. Next is dropping the last digit 3 from 965423 => 96542."
      );
    }
    case 126: {
      return makeMcq(
        "Base 10 Zero Insertion Pattern",
        "Look at the sequence: 11, 10, ?, 100, 1001, 1000, 10001\nWhat term replaces the question mark?",
        ["101", "110", "111", "1001"],
        0,
        "The sequence alternates between (10^k + 1) and 10^k. 11, 10, 101, 100, 1001, 1000, 10001. Missing is 101."
      );
    }
    case 127: {
      return makeMcq(
        "Bar Graph: Food Expenditure",
        "Data Interpretation: A family's monthly budget is Rs. 60,000 allocated as: Food (20%), Savings (15%), Clothing (15%), Housing (10%), Education (10%), Transport (15%), Miscellaneous (15%). How much is spent on Food?",
        ["Rs. 12,000", "Rs. 10,000", "Rs. 14,000", "Rs. 15,000"],
        0,
        "20% of 60,000 = Rs. 12,000."
      );
    }
    case 128: {
      return makeMcq(
        "Bar Graph: Relative Expense Gap",
        "From the budget (Rs. 60,000 total: Clothing 15%, Housing 10%, Transport 15%), how much more money is spent on Clothing and Housing together than on Transport?",
        ["Rs. 6,000", "Rs. 4,500", "Rs. 7,500", "Rs. 9,000"],
        0,
        "(15% + 10%) - 15% = 10%. 10% of 60,000 = Rs. 6,000."
      );
    }
    case 129: {
      return makeMcq(
        "Bar Graph: Education vs Food Percentage",
        "From the budget (Food = 20%, Education = 10%), what percentage of the amount spent on food is spent on education?",
        ["50%", "25%", "40%", "60%"],
        0,
        "(10% / 20%) * 100 = 50%."
      );
    }
    case 130: {
      return makeMcq(
        "Pie Chart Central Angle",
        "In a pie chart representing sales by segment: Segment A (30%), Segment B (25%), Segment C (35%), Segment D (10%). What is the central angle corresponding to Segment A?",
        ["108°", "90°", "126°", "120°"],
        0,
        "Angle = 30% of 360° = 0.30 * 360° = 108°."
      );
    }
    case 131: {
      return makeMcq(
        "Cryptarithmetic Addition",
        "Solve for A, B, C in the cryptarithmetic puzzle: ABC + CBA = 444 where distinct letters represent distinct non-zero digits. A possible solution is:",
        ["A=1, B=2, C=3", "A=2, B=4, C=2", "A=3, B=1, C=1", "A=1, B=7, C=2"],
        0,
        "123 + 321 = 444. Hence A=1, B=2, C=3."
      );
    }
    case 132: {
      return makeMcq(
        "Cryptarithmetic Subtraction",
        "Solve for D, E, F in: DEF - FED = 297 where D=5, F=2. What is the value of E?",
        ["Any single digit 0-9", "E=4", "E=7", "E=0"],
        0,
        "(500 + 10E + 2) - (200 + 10E + 5) = 502 - 205 = 297, independent of E."
      );
    }
    case 133: {
      return makeMcq(
        "Cryptarithmetic Doubling",
        "Solve for X, Y, Z in: XYZ + XYZ = 468 with unique digits. Find X, Y, Z:",
        ["X=2, Y=3, Z=4", "X=2, Y=4, Z=2", "X=3, Y=2, Z=4", "X=1, Y=8, Z=4"],
        0,
        "468 / 2 = 234 => X=2, Y=3, Z=4."
      );
    }
    case 134: {
      return makeMcq(
        "Cryptarithmetic Value Determination",
        "Solve for X, Y, Z in: XYZ + XYZ = 756 with digits. Find X, Y, Z:",
        ["X=3, Y=7, Z=8", "X=3, Y=6, Z=8", "X=4, Y=7, Z=8", "X=3, Y=8, Z=7"],
        0,
        "756 / 2 = 378 => X=3, Y=7, Z=8."
      );
    }
    case 135: {
      return makeMcq(
        "Venn Diagram: Educated and Employed",
        "In a survey of a town represented by a 3-circle Venn Diagram (Educated, Employed, Backward):\nEducated only = 8\nEducated & Employed only = 6\nAll three = 3\nEmployed only = 7\nBackward only = 17\nBackward & Employed only = 5\nBackward & Educated only = 11\nHow many educated people are employed?",
        ["9", "6", "14", "17"],
        0,
        "Educated & Employed = (Educated & Employed only) + (All three) = 6 + 3 = 9."
      );
    }
    case 136: {
      return makeMcq(
        "Venn Diagram: Backward and Educated",
        "Using the same Venn Diagram data (Educated only = 8, All three = 3, Backward & Educated only = 11), how many backward people are educated?",
        ["14", "11", "9", "18"],
        0,
        "Backward & Educated = 11 + 3 = 14."
      );
    }
    case 137: {
      return makeMcq(
        "Venn Diagram: Backward Uneducated Employed",
        "Using the same Venn Diagram data, how many backward uneducated people are employed?",
        ["5", "8", "11", "14"],
        0,
        "Backward & Employed (excluding Educated) = 5."
      );
    }
    case 138: {
      return makeMcq(
        "Venn Diagram: Backward Not Educated",
        "Using the same Venn Diagram data, how many backward people are not educated?",
        ["22", "17", "20", "25"],
        0,
        "Backward not educated = (Backward only) + (Backward & Employed only) = 17 + 5 = 22."
      );
    }
    case 139: {
      return makeMcq(
        "Circular Seating: 8 Persons Relative Position",
        "Eight persons (L, M, N, O, P, Q, R, S) sit in a circle facing inward. N is between L and R. P is second left of N. P and S have 2 persons between them. M neighbors O. One person sits between M and Q. What is O's position relative to S?",
        ["Third to the left", "Immediate right", "Second to the right", "Immediate left"],
        0,
        "Arranging clockwise gives unique valid placement with O third to the left of S."
      );
    }
    case 140: {
      return makeMcq(
        "Circular Seating: Odd Pair Out",
        "Based on the 8-person circular table arrangement (L, M, N, O, P, Q, R, S), four pairs share an adjacent relationship. Which pair does NOT belong to the group?",
        ["RP", "QL", "NM", "MS"],
        0,
        "RP are not directly adjacent whereas the other pairs are adjacent."
      );
    }
    case 141: {
      return makeMcq(
        "Circular Seating: Two Steps from Neighbor",
        "In the 8-person circular seating arrangement, who sits second to the left of the person immediately to the right of O?",
        ["Q", "M", "S", "L"],
        0,
        "Following step-by-step positions resolves to Q."
      );
    }
    case 142: {
      return makeMcq(
        "Circular Seating: Intermediate Person",
        "In the 8-person circular seating arrangement, who sits directly between M and Q?",
        ["O", "L", "N", "S"],
        0,
        "Between M and Q sits O."
      );
    }
    case 143: {
      return makeMcq(
        "Circular Seating: Opposite and Offset",
        "In the 8-person circular seating arrangement, who sits third to the right of the person opposite N?",
        ["L", "S", "R", "O"],
        0,
        "Resolves to L."
      );
    }
    case 144: {
      return makeMcq(
        "Circular Seating: 7 Friends Deduction",
        "Seven friends (P, Q, R, S, T, U, V) sit in a circle facing the center. V is 2nd left of S and neighbors T and U. S is not a neighbor of R or T. P neighbors Q and R. Which of the following is correct?",
        ["Q is between P and S", "S is between U and P", "T is immediate right of V", "U is immediate left of V"],
        0,
        "Deducing the 7-seat circle confirms Q is placed between P and S."
      );
    }
    case 145: {
      return makeMcq(
        "Circular Seating: Immediate Right Pair",
        "In the 7-friends circular seating arrangement, in which of the following pairs is the second person sitting to the immediate right of the first?",
        ["QU", "VU", "TR", "PT"],
        0,
        "QU matches the exact clockwise right adjacent position."
      );
    }
    case 146: {
      return makeMcq(
        "Circular Seating: Swap Outcome",
        "If T and S interchange their places in the 7-friends circle, what will be S's new position?",
        ["Neighbors of V and R", "Immediate left of R", "Immediate right of U", "Neighbors of R and P"],
        0,
        "S will now sit adjacent to V and R."
      );
    }
    case 147: {
      return makeMcq(
        "Circular Seating: Target Position",
        "In the 7-friends circular seating arrangement (with friends seated clockwise as S, U, V, T, R, P, Q facing center), what is the position of R?",
        ["Second to the right of Q", "Third to the left of U", "To the immediate right of P", "Second to the left of V"],
        0,
        "In the clockwise circle S, U, V, T, R, P, Q facing inward: looking from Q facing center, moving counter-clockwise (to Q's right) gives Q -> P -> R. Thus, R is second to the right of Q (and to the immediate right of P)."
      );
    }
    case 148: {
      return makeMcq(
        "Direction Relative Orientation",
        "Y is to the East of X, which is to the North of Z. If P is to the South of Z, then in which direction of Y is P located?",
        ["South-West", "South-East", "North-West", "South"],
        0,
        "X is North of Z => Z is South of X. Y is East of X. P is South of Z => P is South and West of Y => South-West."
      );
    }
    case 149: {
      return makeMcq(
        "Direction: Distance from Origin",
        "A person walks 6 km South, turns right and walks 4 km, then turns left and walks 6 km. In which direction is the person from the starting point?",
        ["South-West", "South-East", "North-West", "West"],
        0,
        "South 6 km -> Right (West) 4 km -> Left (South) 6 km. Total: 12 km South, 4 km West => South-West."
      );
    }
    case 150: {
      return makeMcq(
        "Multi-Direction Step Trajectory",
        "Rasik walked 20 m North. He turned right and walked 30 m. Then he turned right and walked 35 m. Then he turned left and walked 15 m. Finally, he turned left and walked 15 m. In which direction and how many metres is he from his starting position?",
        ["45 m East", "30 m East", "45 m West", "30 m West"],
        0,
        "North 20m -> East 30m -> South 35m (net 15m South) -> East 15m (net 45m East) -> North 15m (cancels South 15m). Final position = 45 m East."
      );
    }
    default:
      return makeMcq(
        `Aptitude Question ${qNum}`,
        `Find the value of x when 2x + ${qNum} = ${qNum * 3}:`,
        [`${qNum}`, `${qNum + 2}`, `${qNum - 2}`, `${qNum * 2}`],
        0,
        `2x = ${qNum * 2} => x = ${qNum}.`
      );
  }
}

export async function seedAptitudeTests() {
  console.log("Generating and Seeding 150-Question Aptitude Assessments: AT1 and AT2...");

  const tests = [
    { code: "AT1", title: "Aptitude Assessment 1 (AT1)" },
    { code: "AT2", title: "Aptitude Assessment 2 (AT2)" },
  ];

  for (const t of tests) {
    const questions = generateQuestionBank(t.code as "AT1" | "AT2");
    console.log(`Generated ${questions.length} questions for ${t.code}`);

    // Upsert Assessment
    const existing = await prisma.assessment.findUnique({
      where: { code: t.code },
    });

    let assessmentId: string;
    if (existing) {
      // Remove old questions to refresh with full 150 bank
      await prisma.question.deleteMany({ where: { assessmentId: existing.id } });
      await prisma.section.deleteMany({ where: { assessmentId: existing.id } });

      const updated = await prisma.assessment.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          description: `Comprehensive 150-Question Aptitude & Logical Reasoning Assessment (${t.code}).`,
          durationMinutes: 90,
          shuffleQuestions: true,
          requireSeb: true,
          sebQuitPassword: "exit123",
          isReviewUnlocked: false,
        },
      });
      assessmentId = updated.id;
      console.log(`Updated existing assessment ${t.code} (${assessmentId})`);
    } else {
      const created = await prisma.assessment.create({
        data: {
          code: t.code,
          title: t.title,
          description: `Comprehensive 150-Question Aptitude & Logical Reasoning Assessment (${t.code}).`,
          durationMinutes: 90,
          shuffleQuestions: true,
          requireSeb: true,
          sebQuitPassword: "exit123",
          isReviewUnlocked: false,
        },
      });
      assessmentId = created.id;
      console.log(`Created new assessment ${t.code} (${assessmentId})`);
    }

    // Insert all 150 questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await prisma.question.create({
        data: {
          assessmentId,
          type: "MCQ",
          title: `Q${i + 1}: ${q.title}`,
          description: q.description,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          order: i,
          mcqType: "SINGLE",
          options: JSON.stringify(q.options),
          correctAnswers: JSON.stringify(q.correctAnswers),
          explanation: q.explanation,
        },
      });
    }
    console.log(`Successfully inserted all 150 questions for ${t.code}!`);
  }

  console.log("All AT1 and AT2 assessments successfully generated and saved.");
}

// Run directly if called as a script
if (process.argv[1]?.includes("generateAptitudeTests")) {
  seedAptitudeTests()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error seeding tests:", err);
      process.exit(1);
    });
}
