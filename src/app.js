import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  query,
  getDocs,
  doc,
  orderBy,
  where,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCN1BDxT-c76cviUnO3QJst4vWL5ScjPa0",
  authDomain: "expense-tracker-19773.firebaseapp.com",
  projectId: "expense-tracker-19773",
  storageBucket: "expense-tracker-19773.appspot.com",
  messagingSenderId: "286503871145",
  appId: "1:286503871145:web:5b7a41f368f20c33713fb8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
const colRef = collection(db, "UsersAuthList");

const signUp = document.getElementById("signup");
if (signUp) {
  signUp.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = signUp.name.value;
    const email = signUp.email.value;
    const password = signUp.password.value;
    
    try {
      document.getElementById("loader").style.display = "block";
      document.querySelector('.signupPage').classList.add("signupLoader");
      // Create a new user in the authentication system
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      document.getElementById("loader").style.display = "none";
      document.querySelector('.signupPage').classList.remove("signupLoader")
      Swal.fire({
        icon: "success",
        title: "Signup Successful!",
        text: "Thank you For Registration",
        showConfirmButton: false,
        timer: 2500,
      });
      if (user) {
        // Add user information to the Firestore collection
        const userDocRef = await addDoc(colRef, {
          name: name,
          email: email,
        });

        // Create default accounts for the user
        const accountsCollection = collection(
          db,
          "UsersAuthList",
          userDocRef.id,
          "accounts"
        );

        // Create "Cash" account
        await addDoc(accountsCollection, {
          accountName: "Saving",
          amount: 0,
        });

        // Create "Saving" account
        await addDoc(accountsCollection, {
          accountName: "Cash",
          amount: 0,
        });
        window.location.href = "index.html";
        history.replaceState(null, "", "index.html");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Swal.fire({
        icon: "error",
        title: "Signup Failed!",
        text: "This Account Already Exist",
        showConfirmButton: false,
        timer: 2500,
      });
      document.getElementById("loader").style.display = "none";
      document.querySelector('.signupPage').classList.remove("signupLoader")
    }
  });
}

const logIn = document.getElementById("login");
if (logIn) {
  logIn.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = logIn.email.value;
    const password = logIn.password.value;

    document.getElementById("loader").style.display = "block";
    document.querySelector('.login-container').classList.add("signupLoader")

    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        const user = cred.user;
        console.log("user present", user);
        const q = query(colRef, where("email", "==", email));
        let UserID;
        onSnapshot(q, (querysnapshot) => {
          if (querysnapshot.size > 0) {
            let loginUserName;
            querysnapshot.docs.forEach((doc) => {
              loginUserName = { ...doc.data() };
              UserID = doc.id;
            });

            if (user) {
              localStorage.setItem(
                "user-info",
                JSON.stringify({
                  id: UserID,
                  email: loginUserName.email,
                })
              );

    document.getElementById("loader").style.display = "none";
    document.querySelector('.login-container').classList.remove("signupLoader")
              window.location.href = "dashboard.html";
              history.replaceState(null, "", "dashboard.html");
            }
          }
        });
        Swal.fire({
          icon: "success",
          title: "Login Succesfully!",
          showConfirmButton: false,
          timer: 2500,
        });
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        Swal.fire({
          icon: "error",
          title: "Authentication Failed!",
          text: "Check your email and password",
          showConfirmButton: false,
          timer: 2500,
        });
      });
  });
}

const resetPassword = document.getElementById("reset");
if (resetPassword) {
  resetPassword.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = resetPassword.email.value;
    const q = query(colRef, where("email", "==", email));
    sendPasswordResetEmail(auth, email).then(() => {
      onSnapshot(q, (querysnapshot) => {
        if (querysnapshot.size > 0) {
          let msg = "Email has been send";
          let div = document.querySelector(".msg");
          div.innerHTML = msg;
          div.style.color = "blue";
          resetPassword.reset();
        } else {
          let msg = "Email Doesn't Exist";
          let div = document.querySelector(".msg");
          div.innerHTML = msg;
          div.style.color = "red";
        }
      });
    });
  });
}

const logOut = document.getElementById("logout");
if (logOut) {
  logOut.addEventListener("click", () => {
    signOut(auth).then(() => {
      localStorage.removeItem("user-info");
      window.location.href = "index.html";
    });
  });
}
// Password
const showPassword = document.getElementById("check");
showPassword? showPassword.addEventListener("click", () => {
      var x = document.getElementById("myInput");
      if (x.type === "password") {
        x.type = "text";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16" style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>`
      } else {
        x.type = "password";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"id="" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16"  style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
      </svg>`
      }
    })
  : null;

// Loader
document.getElementById("loader").style.display = "block";
document.body.classList.add("blur");
onAuthStateChanged(auth, (user) => {
  if (
    !user &&
    !localStorage.getItem("user-info") &&
    window.location.href.indexOf("dashboard.html") !== -1
  ) {
    window.location.href = "index.html";
  }
  if (
    user &&
    localStorage.getItem("user-info") &&
    window.location.href.indexOf("dashboard.html") === -1
  ) {
    window.location.href = "dashboard.html";
  }
  document.getElementById("loader").style.display = "none";
  document.body.classList.remove("blur");
});

// hello each user who login or signUp
const helloUser = document.querySelector(".hello");

let storedData = localStorage.getItem("user-info");
let currentUser = storedData ? JSON.parse(storedData)?.email : null;
let currentUserID = storedData ? JSON.parse(storedData)?.id : null;

document.getElementById("loader").style.display = "block";
document.querySelector('.Dashboard').classList.add("blur");

const q = query(colRef, where("email", "==", currentUser));
onSnapshot(q, (querysnapshot) => {
  if (querysnapshot.size > 0) {
    let loginUserName;
    querysnapshot.docs.forEach((doc) => {
      loginUserName = { ...doc.data() };
    });
    helloUser.innerHTML = `Hello ${loginUserName.name}`;
  }
  document.getElementById("loader").style.display = "none";
  document.querySelector('.Dashboard').classList.remove("blur");
});

// add Accounts
const add = document.querySelector(".add");
add.addEventListener("click", async (e) => {
  let accountNameInput = document.getElementById("addAccount");
  let amountInput = document.getElementById("addAmount");

  let accountName = accountNameInput.value;
  let amount = parseFloat(amountInput.value);

  if (currentUserID && accountName && !isNaN(amount)) {
    if(amount < 0){
      Swal.fire({
        icon: "error",
        title: "Amount Error!",
        text: "Amount should be positive",
        showConfirmButton: false,
        timer: 2500,
      });
      return
    }
    const accountsCollection = collection(
      db,
      "UsersAuthList",
      currentUserID,
      "accounts"
    );

    const querySnapshot = await getDocs(accountsCollection);

    // Check for existing account
      const accountExists = querySnapshot.docs.some((doc) => {
      const accountData = doc.data();
      return (
        accountData.accountName.toLowerCase() === accountName.toLowerCase()
      );
    });

    if (!accountExists) {
      const newAccountData = {
        accountName: accountName,
        amount: amount,
      };
      addDoc(accountsCollection, newAccountData);
      Swal.fire({
        icon: "success",
        title: "Account Added!",
        text: " Account Added Successfully",
        showConfirmButton: false,
        timer: 2500,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Exists!",
        text: "This Account Already Exists",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }
  else {
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      text: "Fill Both Fields First",
      showConfirmButton: false,
      timer: 2500,
    });
  }

  accountNameInput.value = "";
  amountInput.value = "";
});

// SHOW  ACCOUNTS EACH USER HAVE  & DELETE ANY ACCOUNT USER WANTS TO DELETE WITH CONFIRMATION MESSAGE
//Showing totalAmount CashAmount BankTotalAmount & SavingAmount
if (currentUserID) {
  const accountsCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "accounts"
  );
  const accountList = document.querySelector(".accounts-list");
  let cashAmount = document.querySelector(".cashAmount");
  let savingAmount = document.querySelector(".savingAmount");
  let bankAmount = document.querySelector(".bankAmount");
  let totalAmount = document.querySelector(".totalAmount");

  console.log("Before loader code");
  document.getElementById("loader").style.display = "block";
  document.querySelector('.Dashboard').classList.add("blur");
  onSnapshot(accountsCollection, (querySnapshot) => {
    let cashSavingHTML = "";
    let otherAccountsHTML = "";
    let totalBankAmounts = 0;
    let cash = 0;
    let saving = 0;

    querySnapshot.forEach((doc) => {
      const accountData = doc.data();

      if (
        accountData.accountName == "Cash" ||
        accountData.accountName == "Saving"
      ) {
        cashSavingHTML += `<div class="account-item d-flex flex-row justify-content-between">${accountData.accountName}
                          <div class="fw-bold">${accountData.amount}</div></div>`;
        if (accountData.accountName == "Cash") {
          cashAmount.innerHTML = `${accountData.amount}`;
          cash = accountData.amount;
        } else {
          savingAmount.innerHTML = `${accountData.amount}`;
          saving = accountData.amount;
        }
      } else {
        otherAccountsHTML += `<div class="account-item d-flex flex-row justify-content-between">${accountData.accountName}
                  <div class="fw-bold">${accountData.amount}</div> <div class="fw-bold text-primary cross" data-doc-id=${doc.id}>X</div></div>`;
        totalBankAmounts += accountData.amount;
      }
    });
    bankAmount.innerHTML = totalBankAmounts;
    totalAmount.innerHTML = cash + totalBankAmounts + saving;
    const accountHTML = cashSavingHTML + otherAccountsHTML;
    accountList.innerHTML = accountHTML;
    console.log("After loader code");
    document.getElementById("loader").style.display = "none";
    document.querySelector('.Dashboard').classList.remove("blur");
  });

  // Delete Account
  // create an instance of the modal based on the HTML structure you've defined.
  var confirmationModal = new bootstrap.Modal(
    document.getElementById("confirmationModal")
  );
  accountList.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("cross")) {
      const docId = target.getAttribute("data-doc-id");

      // Show the confirmation modal
      confirmationModal.show();

      // Handle the delete action when the "Delete" button in the modal is clicked
      const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
      confirmDeleteBtn.addEventListener("click", () => {
        if (docId) {
          deleteDoc(doc(accountsCollection, docId))
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: " Account Deleted Successfully",
                showConfirmButton: false,
                timer: 2500,
              });
              confirmationModal.hide();
            })
            .catch((error) => {
              console.error("Error deleting account:", error);
              alert("Failed to delete account. Please try again.");
            });
        }
      });
    }
  });
}
// Select options as accountsNames
if (currentUserID) {
  const accountsCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "accounts"
  );
  const selectOptions = document.querySelector(".search-select");
  
  onSnapshot(accountsCollection, (querySnapshot) => {
    selectOptions.innerHTML = `
    <option value="option1" disabled selected>Method</option>
    <option value="Cash">Cash</option>
    <option value="Saving">Saving</option>`; //Default Options of CASH and SAVINGS

    querySnapshot.forEach((doc) => {
      const selectData = doc.data();
      if (
        selectData.accountName !== "Cash" &&
        selectData.accountName !== "Saving"
      ) {
        selectOptions.innerHTML += ` <option value="${selectData.accountName}">${selectData.accountName}</option>`;
      }
    });
  });
}

let incomeAmountTotal = 0;
let expenseAmountTotal = 0;
// show data in transaction table
const displayTransactions = () => {
  const table = document.querySelector(".table");
  const tbody = table.querySelector("tbody");

  const transactionCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "Transactions"
  );
  const sortedTransactionsQuery = query(
    transactionCollection,
    orderBy("date", "asc") 
  );
  document.getElementById("loader").style.display = "block";
  onSnapshot(sortedTransactionsQuery, (Snapshot) => {
    tbody.innerHTML = "";
    incomeAmountTotal = 0; // Reset total amounts
    expenseAmountTotal = 0;
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      const newRow = tbody.insertRow(0);
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);

      if (type === "expense") {
        const { category, amount, method, date } = doc.data();
        expenseAmountTotal += amount;

        cell1.innerHTML = category;
        cell2.innerHTML = method;
        cell3.innerHTML = date;
        cell4.innerHTML = `Rs-${amount}Pkr`;
        cell4.style.color = "red";

        cell5.textContent = "X";
        cell5.style.color = "red";
        cell5.style.cursor = "pointer";
        cell5.style.transition = "font-size 0.3s ease, color 0.3s ease";
        cell5.addEventListener(
          "mouseover",
          () => (cell5.style.fontSize = "larger")
        );
        cell5.addEventListener("mouseout", () => (cell5.style.fontSize = ""));
      }
      if (type === "income") {
        const { amount, method, date } = doc.data();
        incomeAmountTotal += amount;

        cell1.innerHTML = "Money Received";
        cell2.innerHTML = method;
        cell3.innerHTML = date;
        cell4.innerHTML = `Rs${amount}Pkr`;
        cell4.style.color = "green";

        cell5.textContent = "X";
        cell5.style.color = "red";
        cell5.style.cursor = "pointer";
        cell5.style.transition = "font-size 0.3s ease, color 0.3s ease";
        cell5.addEventListener("mouseover",() => (cell5.style.fontSize = "larger"));
        cell5.addEventListener("mouseout", () => (cell5.style.fontSize = ""));
      }
      // Handle the delete action
      cell5.addEventListener("click", () => {
        newRow.remove();
        deleteDoc(doc.ref);
      });
    });
    document.getElementById("loader").style.display = "none";
    // Update the donut chart with the new totals
    updateDonutChart(incomeAmountTotal, expenseAmountTotal);
  });
};

// Donut Chart
// Function to update the donut chart
const updateDonutChart = (incomeTotal, expenseTotal) => {
  console.log(incomeTotal, expenseTotal);

  var ctx = document.getElementById("donutChart").getContext("2d");

  // Check if a Chart instance already exists
  if (window.myDoughnutChart) {
    // Destroy the existing Chart instance
    window.myDoughnutChart.destroy();
  }

  // Create a new Chart instance
  window.myDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Expense", "Income"],
      datasets: [
        {
          data: [expenseTotal, incomeTotal],
          backgroundColor: ["#e74c3c", "#2ecc71"],
          borderColor: "transparent",
        },
      ],
    },
    options: {
      cutoutPercentage: 70,
    },
  });
};

displayTransactions();

// INCOME add cash,bank and saving values
let incomeBtn = document.querySelector(".income");
let confirmTransaction = new bootstrap.Modal(
  document.getElementById("confirmTransaction")
);
let confirmIncome = document.getElementById("confirmIncome");

incomeBtn.addEventListener("click", async () => {
  const amountEntered = document.getElementById("amountInput");
  const selectOptionValue = document.querySelector(".search-select");

  const enteredAmount = parseFloat(amountEntered.value);

  if (isNaN(enteredAmount) || enteredAmount <= 0) {
    // alert("Please enter a valid positive amount.");
    Swal.fire({
      icon: "error",
      title: "Enter Amount!",
      text: "Please enter a valid positive amount.",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }
  if (selectOptionValue.value === "option1") {
    // alert("Please select method to continue");
    Swal.fire({
      icon: "error",
      title: "Select Method!",
      text: "Please select method to continue",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }
  confirmTransaction.show();
});
confirmIncome.addEventListener("click", async () => {
  const amountEntered = document.getElementById("amountInput");
  const selectOptionValue = document.querySelector(".search-select");
  const enteredAmount = parseFloat(amountEntered.value);
  const currentDate = new Date();
  const formattedDateTime = currentDate.toLocaleString("en-GB");

  //  update the Accounts Amount
  const accountsCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "accounts"
  );
  const q = query(
    accountsCollection,
    where("accountName", "==", selectOptionValue.value)
  );
  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const currentAmount = doc.data().amount;

      // Update the database with the new amount
      updateDoc(doc.ref, {
        amount: currentAmount + enteredAmount,
      });
    });
  } catch (error) {
    console.error("Error updating amount:", error);
    alert("Failed to update amount. Please try again.");
    Swal.fire({
      icon: "error",
      title: "Please try again",
      text: "Failed to update amount. Please try again.",
      showConfirmButton: false,
      timer: 2500,
    });
  }

  // Adding Transaction in income DB
  const incomeCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "Transactions"
  );
  try {
    Swal.fire({
      icon: "success",
      title: "Transaction Successful!",
      showConfirmButton: false,
      timer: 2500,
    });
    await addDoc(incomeCollection, {
      type: "income",
      amount: enteredAmount,
      method: selectOptionValue.value,
      date: formattedDateTime,
    });
  } catch (error) {
    console.error("Error adding income transaction:", error);
    alert("Failed to add income transaction. Please try again.");
  }

  // hide modal
  confirmTransaction.hide();
  amountEntered.value = "";
  categorySelect.selectedIndex = "option1";
});

// EXPENSE subtract cash,bank and saving values
let expenseBtn = document.querySelector(".expense");
let confirmTransactionExpense = new bootstrap.Modal(
  document.getElementById("confirmTransactionExpense")
);
let confirmExpense = document.getElementById("confirmExpense");

expenseBtn.addEventListener("click", () => {
  const amountEntered = document.getElementById("amountInput");
  const selectOptionValue = document.querySelector(".search-select");
  const categorySelect = document.querySelector(".category-select");

  const enteredAmount = parseFloat(amountEntered.value);

  if (isNaN(enteredAmount) || enteredAmount <= 0) {
    Swal.fire({
      icon: "error",
      title: "Enter Amount!",
      text: "Please enter a valid positive amount.",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  if (
    selectOptionValue.value === "option1" ||
    categorySelect.value === "option1"
  ) {
    Swal.fire({
      icon: "error",
      title: "Select Method and Category!",
      text: "Please select both method and category to continue",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }
  confirmTransactionExpense.show();
});
confirmExpense.addEventListener("click", async () => {
  const amountEntered = document.getElementById("amountInput");
  const selectOptionValue = document.querySelector(".search-select");
  const categorySelect = document.querySelector(".category-select");
  const currentDate = new Date();
  const formattedDateTime = currentDate.toLocaleString("en-GB");

  const enteredAmount = parseFloat(amountEntered.value);

  // update amount
  let sweetAlert = false;
  const accountsCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "accounts"
  );
  const q = query(
    accountsCollection,
    where("accountName", "==", selectOptionValue.value)
  );
  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const currentAmount = doc.data().amount;
      if (currentAmount >= enteredAmount) {
        updateDoc(doc.ref, {
          amount: currentAmount - enteredAmount,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Transaction Failed!",
          text: "You Dont Have Enough Balance Left",
          showConfirmButton: false,
          timer: 2500,
        });
        sweetAlert = true;
      }
    });
  } catch (error) {
    console.error("Error updating amount:", error);
    alert("Failed to update amount. Please try again.");
  }

  // Adding Transaction in DB
  const expenseCollection = collection(
    db,
    "UsersAuthList",
    currentUserID,
    "Transactions"
  );
  if (!sweetAlert) {
    try {
      Swal.fire({
        icon: "success",
        title: "Transaction Successful!",
        showConfirmButton: false,
        timer: 2500,
      });
      await addDoc(expenseCollection, {
        type: "expense",
        category: categorySelect.value,
        amount: enteredAmount,
        method: selectOptionValue.value,
        date: formattedDateTime,
      });
    } catch (error) {
      console.error("Error adding expense transaction:", error);
      alert("Failed to add expense transaction. Please try again.");
    }
  }
  
  // Hide the confirmation modal after processing
  confirmTransactionExpense.hide();
  amountEntered.value = "";
  categorySelect.selectedIndex = "option1";
});

// AddCategory
const categorySelect = document.querySelector(".category-select");
const categoryInput = document.getElementById("categoryInput");
const addCategoryBtn = document.querySelector(".addCategoryBtn");
addCategoryBtn.addEventListener("click", () => {
  const newCategory = categoryInput.value.trim();

  if (newCategory !== "" && /^[a-zA-Z]+$/.test(newCategory)) {
    // Check if the category already exists in the select options
    if (
      [...categorySelect.options].some(
        (option) => option.value.toLowerCase() === newCategory.toLowerCase()
      )
    ) {
      Swal.fire({
        icon: "error",
        title: "Exists!",
        text: "Category Already Exists",
        showConfirmButton: false,
        timer: 2500,
      });
    } else {
      // Clear the input field
      categoryInput.value = "";
      const categoryCollection = collection(
        db,
        "UsersAuthList",
        currentUserID,
        "categories"
      );
      addDoc(categoryCollection, {
        category: newCategory,
      });
      Swal.fire({
        icon: "success",
        title: "Category Added Successful!",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Invalid Category!",
      text: "Please enter valid category ",
      showConfirmButton: false,
      timer: 2500,
    });
  }
});

// show categories
const categoryCollection = collection(
  db,
  "UsersAuthList",
  currentUserID,
  "categories"
);
onSnapshot(categoryCollection, (categorySnapshot) => {
  categorySelect.innerHTML = "";
  categorySelect.innerHTML = `          
  <option value="option1" disabled selected>Select Category</option>
  <option value="Home">Home</option>
  <option value="Shopping">Shopping</option>
  <option value="Grocery">Grocery</option>`;
  categorySnapshot.forEach((doc) => {
    const { category } = doc.data();
    const option = document.createElement("option");
    option.value = category;
    option.text = category;
    option.dataset.docId = doc.id;
    categorySelect.add(option);
  });
});

// Delete Category
const deleteCategoryBtn = document.querySelector(".deleteCategoryBtn");
deleteCategoryBtn.addEventListener("click", async () => {
  const categoryDeleteInput = document.getElementById("categoryDeleteInput");
  const selectedValue = categoryDeleteInput.value.trim();

  const selectedOption = [...categorySelect.options].find(
    (option) => option.value === selectedValue
  );
  if (selectedOption) {
    const selectedDocId = selectedOption.dataset.docId;

    if (selectedDocId) {
      // Log the selected document ID for debugging
      console.log("Selected Category ID:", selectedDocId);

      // Clear the input field
      categoryDeleteInput.value = "";

      // Delete the category from the Firestore database using the ID
      const categoryCollection = collection(
        db,
        "UsersAuthList",
        currentUserID,
        "categories"
      );

      try {
        await deleteDoc(doc(categoryCollection, selectedDocId));
        Swal.fire({
          icon: "success",
          title: "Category Deleted Successful!",
          showConfirmButton: false,
          timer: 2500,
        });
      } catch (error) {
        console.error("Error deleting category from Firestore:", error);
        Swal.fire({
          icon: "error",
          title: "Please try again!",
          text:"Failed to delete category. Please try again.",
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Default Value!",
        text:"You can't delete default category",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "No Category Selected!",
      text:"You entered invalid category",
      showConfirmButton: false,
      timer: 2500,
    });
  }
});
