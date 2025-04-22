import { facebook, instagram, twitter } from "../assets/icons";
import { productImg1, productImg2, productImg3, productImg4 } from "../assets/images";

export const navLinks = [
    { href: "/", label: "Home" },
    { href: "#Vehicle-Informatio", label: "Vehicle Information" },
    { href: "#parts", label: "Parts" },
    { href: "#services", label: "Services and Packages" },
    //{ href: "#packages", label: "Packages" },
];

export const cartItems = [
    {
        productID: 1,
        imgURL: productImg1,
        name: "Valvoline Premium Protection",
        subHeading: "3L",
        unitPrice: 10750,
        quantity: 1,
        total: function() { return this.unitPrice * this.quantity; }
    },
    {
        productID: 2,
        imgURL: productImg2,
        name: "Valvoline Brake Fluid",
        subHeading: "",
        unitPrice: 1110,
        quantity: 2,
        total: function() { return this.unitPrice * this.quantity; }
    },
    {
        productID: 3,
        imgURL: productImg3,
        name: "Simoniz Original Wax",
        subHeading: "",
        unitPrice: 3585,
        quantity: 1,
        total: function() { return this.unitPrice * this.quantity; }
    },
    {
        productID: 4,
        imgURL: productImg4,
        name: "Eagle One Tyre Swiper",
        subHeading: "",
        unitPrice: 530,
        quantity: 4,
        total: function() { return this.unitPrice * this.quantity; }
    }
];

export const products = [
    {
        productID: 1,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower MST 5W-30 5L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "van"
    },
    {
        productID: 2,
        imgURL: productImg2,
        name : "Havoline",
        subHeading: "ProDS Fully Synthetic 5W 4L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "2000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "car"
    },
    {
        productID: 3,
        imgURL: productImg3,
        name : "Valvoline",
        subHeading: "Premium Blue 15W-40 5L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "3000",
        isInStock: false,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "suv"
    },
    {
        productID: 4,
        imgURL: productImg3,
        name : "Valvoline",
        subHeading: "Gear Oil 80W-90 1L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "van"
    },
    {
        productID: 5,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "car"
    },
    {
        productID: 6,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "suv"
    },
    {
        productID: 7,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "van"
    },
    {
        productID: 8,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "car"
    },
    {
        productID: 9,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower",
        price: "1000",
        isInStock: false,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "suv"
    },
    {
        productID: 10,
        imgURL: productImg1,
        name : "Valvoline",
        subHeading: "Synpower MST 5W-30 5L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "1000",
        isInStock: false,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "van"
    },
    {
        productID: 11,
        imgURL: productImg2,
        name : "Havoline",
        subHeading: "ProDS Fully Synthetic 5W-30 4L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "2000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "car"
    },
    {
        productID: 12,
        imgURL: productImg3,
        name : "Valvoline",
        subHeading: "Premium Blue 15W-40 5L",
        description:"Valvoline Synpower MST 5W30 is premium quality full synthetic motor oil formulated for ultimate performance and protection under all operating conditions. This engine oil is designed to fulfill the latest standards of leading engine manufacturers (OEMs)",
        price: "3000",
        isInStock: true,
        reviews: 368,
        soldCount: 823,
        rating: 4.5,
        sizes: ["1L", "4L", "5L"],
        category: "suv"
    },{
        productID: 13,
        imgURL: productImg3,
        name: "Castrol EDGE",
        subHeading: "Titanium FST 0W-40 4L",
        description: "Castrol EDGE 0W-40 A3/B4 is an advanced full synthetic motor oil with Fluid TITANIUM Technology, providing superior strength under pressure to keep metal apart and reduce friction for maximum engine performance.",
        price: "4200",
        isInStock: true,
        reviews: 152,
        soldCount: 409,
        rating: 4.8,
        sizes: ["1L", "4L"],
        category: "van"
    },
    {
        productID: 14,
        imgURL: productImg1,
        name: "Mobil 1",
        subHeading: "Extended Performance 5W-30 5L",
        description: "Mobil 1 Extended Performance 5W-30 is designed to keep your engine running like new by providing exceptional wear protection, cleaning power and overall performance for up to 20,000 miles between oil changes.",
        price: "4500",
        isInStock: false,
        reviews: 233,
        soldCount: 311,
        rating: 4.6,
        sizes: ["1L", "5L"],
        category: "car"
    },
    {
        productID: 15,
        imgURL: productImg2,
        name: "Shell Helix",
        subHeading: "Ultra ECT C3 5W-30 4L",
        description: "Shell Helix Ultra ECT C3 features exceptional cleansing power and engine wear protection with Shell's proprietary PurePlus Technology. It is formulated for fuel efficiency and to lower maintenance costs.",
        price: "3800",
        isInStock: true,
        reviews: 89,
        soldCount: 527,
        rating: 4.4,
        sizes: ["1L", "4L", "5L"],
        category: "van"
    },
    {
        productID: 16,
        imgURL: productImg1,
        name: "Total Quartz",
        subHeading: "9000 Energy 0W-30 4L",
        description: "Total Quartz 9000 Energy 0W-30 is developed to meet the needs of modern engines. It ensures maximum engine protection and performance due to its enhanced synthetic technology, suitable for the most demanding driving conditions.",
        price: "3500",
        isInStock: false,
        reviews: 76,
        soldCount: 201,
        rating: 4.7,
        sizes: ["1L", "4L"],
        category: "suv"
    },
    {
        productID: 17,
        imgURL: productImg3,
        name: "Pennzoil",
        subHeading: "Platinum Full Synthetic 5W-30 5L",
        description: "Pennzoil Platinum Full Synthetic 5W-30 motor oil is made from natural gas, not crude, using Pennzoil’s patented gas-to-liquid PurePlus Technology which provides a base oil that is crystal clear and contains fewer impurities than crude oil.",
        price: "4000",
        isInStock: true,
        reviews: 190,
        soldCount: 645,
        rating: 4.9,
        sizes: ["1L", "5L"],
        category: "car"
    }
    
]

export const socialMedia = [
    { src: facebook, alt: "facebook logo" },
    { src: twitter, alt: "twitter logo" },
    { src: instagram, alt: "instagram logo" },
];